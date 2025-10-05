import { useEffect, useState, useRef } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { supabase, type Invoice, type InvoiceItem } from '../lib/supabase';

type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
};

export default function InvoicePDF({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      setInvoice({ ...invoiceData, items: itemsData });
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoiceNumber = async () => {
    if (!customInvoiceNumber || !invoice || customInvoiceNumber === invoice.invoice_number.replace('INV-', '')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ invoice_number: `INV-${customInvoiceNumber}` })
        .eq('id', invoiceId);

      if (error) throw error;

      // Update local state
      setInvoice(prev => prev ? { ...prev, invoice_number: `INV-${customInvoiceNumber}` } : null);
    } catch (error) {
      console.error('Error updating invoice number:', error);
      alert('Erreur lors de la mise à jour du numéro de facture');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-900" size={32} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-gray-500">
        Facture introuvable
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 font-sans text-black" style={{ fontFamily: "'Arial', sans-serif" }}>
      <div className="flex gap-3 justify-end print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="invoice-number" className="font-semibold">Numéro de facture :</label>
            <input
              id="invoice-number"
              type="text"
              className="border border-black rounded px-3 py-2 w-32"
              value={customInvoiceNumber ?? ''}
              onChange={(e) => setCustomInvoiceNumber(e.target.value)}
              placeholder="Ex: 001"
            />
            <button
              onClick={handleSaveInvoiceNumber}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition-colors"
        >
          <Printer size={20} />
          Imprimer / Télécharger PDF
        </button>
      </div>

      <div ref={printRef} id="invoice-content" className="bg-white" style={{ maxWidth: 595, margin: '0 auto', padding: 20, fontSize: 12, lineHeight: 1.2, color: '#000' }}>
        <div style={{ backgroundColor: '#333', height: 60, position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', right: 20, top: 10, color: '#fff', fontSize: 24, fontStyle: 'italic', fontFamily: "'Brush Script MT', cursive" }}>
            SA LY
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 4, margin: 0 }}>FACTURE</h1>
          <div style={{ textAlign: 'right' }}>
            <div><strong>DATE :</strong> {formatDate(invoice.issue_date)}</div>
            <div><strong>FACTURE N° :</strong> {customInvoiceNumber || invoice.invoice_number.replace('INV-', '')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderTop: '4px solid #333', borderBottom: '4px solid #333', backgroundColor: '#eee', padding: 10 }}>
          <div>
            <strong>ÉMETTEUR :</strong>
            <div>Nom : {invoice.company_last_name}</div>
            <div>Prénom : {invoice.company_first_name}</div>
            <div>Téléphone : {invoice.company_phone}</div>
            <div>e-mail : {invoice.company_email}</div>
            <div>Adresse : {invoice.company_address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>DESTINATAIRE :</strong>
            <div>{invoice.client_name}</div>
            {invoice.client_phone && <div>{invoice.client_phone}</div>}
            {invoice.client_address && <div style={{ whiteSpace: 'pre-line' }}>{invoice.client_address}</div>}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 10 }}>
          <thead style={{ backgroundColor: '#333', color: '#fff' }}>
            <tr>
              <th style={{ border: '1px solid #333', padding: 5, textAlign: 'left' }}>Description :</th>
              <th style={{ border: '1px solid #333', padding: 5, textAlign: 'center' }}>Date</th>
              <th style={{ border: '1px solid #333', padding: 5, textAlign: 'center' }}>Prix Unitaire : H</th>
              <th style={{ border: '1px solid #333', padding: 5, textAlign: 'center' }}>Quantité : H</th>
              <th style={{ border: '1px solid #333', padding: 5, textAlign: 'right' }}>Total :</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ border: '1px solid #ccc', padding: 5 }}>{item.description}</td>
                <td style={{ border: '1px solid #ccc', padding: 5, textAlign: 'center' }}>{item.item_date ? formatDate(item.item_date) : ''}</td>
                <td style={{ border: '1px solid #ccc', padding: 5, textAlign: 'center' }}>{item.unit_price.toFixed(2)}€</td>
                <td style={{ border: '1px solid #ccc', padding: 5, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #ccc', padding: 5, textAlign: 'right', fontWeight: 'bold', color: '#333' }}>{item.amount.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: '50%', backgroundColor: '#eee', padding: 10, border: '1px solid #ccc' }}>
            <strong>Instructions de paiement :</strong>
            {invoice.payment_instructions && (
              <p style={{ fontSize: 10, whiteSpace: 'pre-line' }}>{invoice.payment_instructions}</p>
            )}

            {(invoice.bank_name || invoice.bank_iban || invoice.bank_bic) && (
              <>
                <strong>RÈGLEMENT :</strong>
                <p>Par virement bancaire :</p>
                {invoice.bank_name && <p>Banque : {invoice.bank_name}</p>}
                {invoice.bank_iban && <p>IBAN : {invoice.bank_iban}</p>}
                {invoice.bank_bic && <p>BIC : {invoice.bank_bic}</p>}
              </>
            )}
          </div>

          <div style={{ width: '45%', textAlign: 'right', backgroundColor: '#f0f8ff', padding: 10, border: '1px solid #ccc' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>
              <div>TOTAL HT : <span style={{ marginLeft: 20 }}>{invoice.total.toFixed(2)}€</span></div>
              <div style={{ marginTop: 10 }}>TOTAL : <span style={{ marginLeft: 20 }}>{invoice.total.toFixed(2)}€</span></div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ fontSize: 10, marginBottom: 20, padding: 10, borderTop: '1px solid #ccc', backgroundColor: '#fffacd' }}>
            <p style={{ whiteSpace: 'pre-line' }}>{invoice.notes}</p>
          </div>
        )}

        <div style={{ backgroundColor: '#333', color: '#fff', padding: 10, fontSize: 10 }}>
          <strong>Infos sur l'entreprise :</strong>
          <p>{invoice.company_first_name} {invoice.company_last_name} - {invoice.company_name}</p>
          {(invoice.company_siren || invoice.company_ape) && (
            <p>
              {invoice.company_siren && `SIREN ${invoice.company_siren}`}
              {invoice.company_siren && invoice.company_ape && ' - '}
              {invoice.company_ape && `APE ${invoice.company_ape}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
