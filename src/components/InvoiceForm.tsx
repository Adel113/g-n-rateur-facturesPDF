import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type InvoiceFormData = {
  company_first_name: string;
  company_last_name: string;
  company_phone: string;
  company_email: string;
  company_address: string;
  company_name: string;
  company_siren: string;
  company_ape: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  bank_name: string;
  bank_iban: string;
  bank_bic: string;
  payment_instructions: string;
  legal_text: string;
};

type LineItem = {
  description: string;
  item_date: string;
  unit_price: number;
  quantity: number;
  details: string;
};

export default function InvoiceForm({ onInvoiceCreated }: { onInvoiceCreated: (invoiceId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const calculateDueDate = (issueDate: string) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<InvoiceFormData>({
    company_first_name: import.meta.env.VITE_DEFAULT_COMPANY_FIRST_NAME || '',
    company_last_name: import.meta.env.VITE_DEFAULT_COMPANY_LAST_NAME || '',
    company_phone: import.meta.env.VITE_DEFAULT_COMPANY_PHONE || '',
    company_email: import.meta.env.VITE_DEFAULT_COMPANY_EMAIL || '',
    company_address: import.meta.env.VITE_DEFAULT_COMPANY_ADDRESS || '',
    company_name: import.meta.env.VITE_DEFAULT_COMPANY_NAME || '',
    company_siren: import.meta.env.VITE_DEFAULT_COMPANY_SIREN || '',
    company_ape: import.meta.env.VITE_DEFAULT_COMPANY_APE || '',
    client_name: '',
    client_phone: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: calculateDueDate(new Date().toISOString().split('T')[0]),
    bank_name: import.meta.env.VITE_DEFAULT_BANK_NAME || '',
    bank_iban: import.meta.env.VITE_DEFAULT_BANK_IBAN || '',
    bank_bic: import.meta.env.VITE_DEFAULT_BANK_BIC || '',
    payment_instructions: import.meta.env.VITE_DEFAULT_PAYMENT_INSTRUCTIONS || '',
    legal_text: import.meta.env.VITE_DEFAULT_LEGAL_TEXT || '',
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: 'Prestation de service', item_date: new Date().toISOString().split('T')[0], unit_price: 30, quantity: 1, details: '' },
  ]);

  const addItem = () => {
    setItems([...items, { description: 'Prestation de service', item_date: new Date().toISOString().split('T')[0], unit_price: 30, quantity: 1, details: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const total = calculateTotal();

      const { legal_text, ...invoiceData } = formData;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          ...invoiceData,
          subtotal: total,
          tax_amount: 0,
          tax_rate: 0,
          total: total,
          status: 'draft',
          notes: legal_text,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        item_date: item.item_date,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        details: item.details,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      onInvoiceCreated(invoice.id);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">ÉMETTEUR</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.company_last_name}
                onChange={(e) => setFormData({ ...formData, company_last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.company_first_name}
                onChange={(e) => setFormData({ ...formData, company_first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              required
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input
              type="text"
              required
              value={formData.company_address}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">DESTINATAIRE</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea
              value={formData.client_address}
              onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={formData.issue_date}
            onChange={(e) => {
              const newIssueDate = e.target.value;
              setFormData({
                ...formData,
                issue_date: newIssueDate,
                due_date: calculateDueDate(newIssueDate),
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Échéance *</label>
          <input
            type="date"
            required
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Articles</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded p-4 space-y-3">
              <div className="grid md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={item.item_date}
                    onChange={(e) => updateItem(index, 'item_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="text"
                      disabled
                      value={`${(item.quantity * item.unit_price).toFixed(2)} €`}
                      className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-700 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-12 gap-3">
                <div className="md:col-span-11">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Détails</label>
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) => updateItem(index, 'details', e.target.value)}
                    placeholder="Ex: urgo Chenôve 13h-->16h 21h-->00h"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Infos sur l'entreprise</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SIREN *</label>
            <input
              type="text"
              required
              value={formData.company_siren}
              onChange={(e) => setFormData({ ...formData, company_siren: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">APE *</label>
            <input
              type="text"
              required
              value={formData.company_ape}
              onChange={(e) => setFormData({ ...formData, company_ape: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Règlement</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
            <input
              type="text"
              value={formData.bank_iban}
              onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BIC</label>
            <input
              type="text"
              value={formData.bank_bic}
              onChange={(e) => setFormData({ ...formData, bank_bic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions de paiement</label>
          <textarea
            value={formData.payment_instructions}
            onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mentions légales</label>
          <textarea
            value={formData.legal_text}
            onChange={(e) => setFormData({ ...formData, legal_text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded p-6 space-y-2">
        <div className="flex justify-between text-2xl font-bold">
          <span>TOTAL HT:</span>
          <span>{calculateTotal().toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-2xl font-bold">
          <span>TOTAL:</span>
          <span>{calculateTotal().toFixed(2)} €</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Création en cours...' : 'Créer la facture'}
      </button>
    </form>
  );
}
