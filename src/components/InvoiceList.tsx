import { useEffect, useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import { supabase, type Invoice } from '../lib/supabase';

export default function InvoiceList({ onViewInvoice }: { onViewInvoice: (invoiceId: string) => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
    };
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chargement des factures...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Aucune facture créée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Mes factures</h2>
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Client:</span> {invoice.client_name}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(invoice.issue_date)}</p>
                  <p><span className="font-medium">Échéance:</span> {formatDate(invoice.due_date)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-gray-900">{invoice.total.toFixed(2)} €</p>
                  <p className="text-sm text-gray-500">TTC</p>
                </div>
                <button
                  onClick={() => onViewInvoice(invoice.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] text-base"
                >
                  <Eye size={20} />
                  Voir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
