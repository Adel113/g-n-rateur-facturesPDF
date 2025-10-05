import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ACCESS_CODE = '1234'; // In a real app, this should be configurable or from environment

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem('invoice_app_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('invoice_app_authenticated', 'true');
      setError('');
    } else {
      setError('Code d\'accès incorrect');
      setCode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('invoice_app_authenticated');
    setCode('');
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès sécurisé</h1>
            <p className="text-gray-600">Veuillez saisir le code d'accès pour continuer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'accès
              </label>
              <input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                placeholder="••••"
                maxLength={10}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={20} />
              Accéder
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Contactez l'administrateur pour obtenir le code d'accès</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout button - hidden in print */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          title="Se déconnecter"
        >
          <Lock size={16} />
          Déconnexion
        </button>
      </div>
      {children}
    </div>
  );
}
