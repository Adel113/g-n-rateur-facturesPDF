import { useState } from 'react';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePDF from './components/InvoicePDF';
import InvoiceList from './components/InvoiceList';

type View = 'list' | 'create' | 'view';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const handleInvoiceCreated = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setCurrentView('view');
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setCurrentView('view');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInvoiceId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Générateur de Factures</h1>
                <p className="text-gray-600">Créez et gérez vos factures professionnelles</p>
              </div>
            </div>
            {currentView !== 'list' && (
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                Retour
              </button>
            )}
          </div>
        </header>

        <main>
          {currentView === 'list' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentView('create')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Nouvelle facture
                </button>
              </div>
              <InvoiceList onViewInvoice={handleViewInvoice} />
            </div>
          )}

          {currentView === 'create' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une nouvelle facture</h2>
              <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
            </div>
          )}

          {currentView === 'view' && selectedInvoiceId && (
            <InvoicePDF invoiceId={selectedInvoiceId} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
