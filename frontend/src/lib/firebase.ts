import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasKeys = !!(config.apiKey && config.authDomain && config.projectId && config.appId);
const app = hasKeys ? (getApps()[0] ?? initializeApp(config)) : undefined;

if (!hasKeys) {
  console.warn("Firebase config missing. Check frontend/.env.local (for dev) or Vercel env vars (for prod).");
}

export const auth = app ? getAuth(app) : (undefined as any);
export const googleProvider = new GoogleAuthProvider();
