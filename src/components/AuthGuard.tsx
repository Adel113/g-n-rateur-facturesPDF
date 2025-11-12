import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || '1993';

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [method, setMethod] = useState<'code' | 'email'>('code');

  // Code method
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Email method
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check existing local access-code auth
    const storedAuth = localStorage.getItem('invoice_app_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      return;
    }

    // Listen to Firebase Auth state
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        // don't override local code-based auth
        setIsAuthenticated(!!storedAuth && storedAuth === 'true');
      }
    });

    return () => unsub();
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('invoice_app_authenticated', 'true');
      setError('');
    } else {
      setError("Code d'accès incorrect");
      setCode('');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will set isAuthenticated
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error?.message || 'Erreur authentification');
    }
  };

  const handleLogout = async () => {
    // clear local code auth
    localStorage.removeItem('invoice_app_authenticated');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCode('');
    setError('');
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès sécurisé</h1>
            <p className="text-gray-600">Choisissez une méthode de connexion</p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            <button onClick={() => setMethod('code')} className={`px-4 py-2 rounded ${method === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Code</button>
            <button onClick={() => setMethod('email')} className={`px-4 py-2 rounded ${method === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Email</button>
          </div>

          {method === 'code' ? (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">Code d'accès</label>
                <input
                  id="access-code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="••••"
                  maxLength={20}
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <Check size={20} />
                Accéder
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded" required />
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}
              <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded">Se connecter</button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Contactez l'administrateur pour obtenir l'accès</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout button - hidden in print */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm" title="Se déconnecter">
          <Lock size={16} />
          Déconnexion
        </button>
      </div>
      {children}
    </div>
  );
}
