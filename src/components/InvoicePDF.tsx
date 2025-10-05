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
    return `${day}/ ${month}/ ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 justify-end print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="invoice-number" className="font-semibold text-gray-700">Numéro de facture :</label>
            <input
              id="invoice-number"
              type="text"
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 w-32"
              value={customInvoiceNumber ?? ''}
              onChange={(e) => setCustomInvoiceNumber(e.target.value)}
              placeholder="Ex: 001"
            />
            <button
              onClick={handleSaveInvoiceNumber}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors"
        >
          <Printer size={20} />
          Imprimer / Télécharger PDF
        </button>
      </div>

      <div ref={printRef} id="invoice-content" className="bg-white shadow-lg print:shadow-none print:bg-white" style={{ fontFamily: 'Georgia, serif' }}>
        <style>
          {`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .print\\:shadow-none {
                box-shadow: none !important;
              }
              .print\\:bg-white {
                background-color: white !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
              }
              #invoice-content {
                page-break-inside: avoid;
                page-break-after: avoid;
                page-break-before: avoid;
                font-size: 10pt;
                line-height: 1.1;
                max-height: 280mm;
                overflow: hidden;
              }
              h1, h3 {
                page-break-after: avoid;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
              .avoid-break {
                page-break-inside: avoid;
              }
            }
          `}
        </style>
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-1 mb-4">
          <div className="absolute top-2 right-6 text-white text-3xl font-bold italic" style={{ fontFamily: 'serif' }}>
            SA LY
          </div>
          <div className="relative z-10">
            <div className="h-8"></div>
          </div>
        </div>

        <div className="px-6 py-2">
          <div className="flex justify-between items-start mb-4 avoid-break">
            <div>
              <h1 className="text-5xl font-extrabold text-blue-900 mb-2" style={{ letterSpacing: '0.1em' }}>FACTURE</h1>
            </div>
            <div className="text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 avoid-break">
              <p className="text-base mb-1"><span className="font-bold text-gray-700">DATE :</span> <span className="text-gray-900">{formatDate(invoice.issue_date)}</span></p>
              <p className="text-base"><span className="font-bold text-gray-700">FACTURE N° :</span> <span className="text-gray-900">{customInvoiceNumber || invoice.invoice_number.replace('INV-', '')}</span></p>
            </div>
          </div>

          <div className="border-t-4 border-b-4 border-blue-900 py-4 mb-4 bg-gray-50 avoid-break">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-base mb-3 text-blue-900 uppercase tracking-wide">ÉMETTEUR :</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold text-gray-700">Nom :</span> <span className="text-gray-900">{invoice.company_last_name}</span></p>
                  <p><span className="font-semibold text-gray-700">Prénom :</span> <span className="text-gray-900">{invoice.company_first_name}</span></p>
                  <p><span className="font-semibold text-gray-700">Téléphone :</span> <span className="text-gray-900">{invoice.company_phone}</span></p>
                  <p><span className="font-semibold text-gray-700">e-mail :</span> <span className="text-gray-900">{invoice.company_email}</span></p>
                  <p><span className="font-semibold text-gray-700">Adresse :</span> <span className="text-gray-900">{invoice.company_address}</span></p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-base mb-3 text-blue-900 uppercase tracking-wide">DESTINATAIRE :</h3>
                <div className="text-sm space-y-1">
                  <p className="font-bold text-base text-gray-900">{invoice.client_name}</p>
                  {invoice.client_phone && <p className="text-gray-700">{invoice.client_phone}</p>}
                  {invoice.client_address && <p className="whitespace-pre-line text-gray-700">{invoice.client_address}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 avoid-break">
            <table className="w-full text-sm border-collapse border border-gray-300 shadow-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="text-left py-2 px-3 font-bold border-r border-blue-800">Description :</th>
                  <th className="text-center py-2 px-3 font-bold border-r border-blue-800">Date</th>
                  <th className="text-center py-2 px-3 font-bold border-r border-blue-800">Prix Unitaire : H</th>
                  <th className="text-center py-2 px-3 font-bold border-r border-blue-800">Quantité : H</th>
                  <th className="text-right py-2 px-3 font-bold">Total :</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <div className="font-medium">{item.description}</div>
                      {item.details && <div className="text-xs mt-1 text-gray-600">Détails : {item.details}</div>}
                    </td>
                    <td className="text-center py-2 px-3 border-r border-gray-200">{item.item_date ? formatDate(item.item_date) : ''}</td>
                    <td className="text-center py-2 px-3 border-r border-gray-200">{item.unit_price.toFixed(2)}€</td>
                    <td className="text-center py-2 px-3 border-r border-gray-200">{item.quantity}</td>
                    <td className="text-right py-2 px-3 font-semibold text-blue-900">{item.amount.toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 avoid-break">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-base mb-3 text-blue-900 uppercase tracking-wide">Instructions de paiement :</h3>
              {invoice.payment_instructions && (
                <p className="text-sm mb-3 whitespace-pre-line text-gray-700">{invoice.payment_instructions}</p>
              )}

              {(invoice.bank_name || invoice.bank_iban || invoice.bank_bic) && (
                <>
                  <h3 className="font-bold text-base mb-2 text-blue-900 uppercase tracking-wide">RÈGLEMENT :</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-700">Par virement bancaire :</p>
                    {invoice.bank_name && <p><span className="font-medium">Banque :</span> {invoice.bank_name}</p>}
                    {invoice.bank_iban && <p><span className="font-medium">IBAN :</span> {invoice.bank_iban}</p>}
                    {invoice.bank_bic && <p><span className="font-medium">BIC :</span> {invoice.bank_bic}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="text-right avoid-break">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <div className="text-xl">
                    <span className="font-bold text-gray-700">TOTAL HT :</span>
                    <span className="ml-4 font-extrabold text-blue-900">{invoice.total.toFixed(2)}€</span>
                  </div>
                  <div className="text-xl border-t-2 border-blue-300 pt-2">
                    <span className="font-bold text-gray-700">TOTAL :</span>
                    <span className="ml-4 font-extrabold text-blue-900">{invoice.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-sm leading-relaxed mb-4 border-t-2 border-gray-300 pt-4 bg-yellow-50 p-3 rounded-lg avoid-break">
              <p className="whitespace-pre-line text-gray-800">{invoice.notes}</p>
            </div>
          )}

          <div className="bg-blue-900 text-white px-6 py-4 text-sm rounded-lg shadow-md avoid-break">
            <h3 className="font-bold mb-2 text-base uppercase tracking-wide">Infos sur l'entreprise :</h3>
            <p className="mb-1">{invoice.company_first_name} {invoice.company_last_name} - {invoice.company_name}</p>
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
    </div>
  );
}
