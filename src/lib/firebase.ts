import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config - values provided via Vite env variables (prefixed VITE_)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket omitted intentionally: this project will not use Firebase Storage
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Export commonly used services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Note:
// - For client-side apps (Vite) use the modular Firebase JS SDK as above.
// - This project is configured to NOT use Firebase Storage (uploads/downloads are
//   not handled by Firebase Storage). For large data migrations, use the Firebase
//   Admin SDK in a server script (service account) because it has elevated
//   privileges and avoids auth limits.
