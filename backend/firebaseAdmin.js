// backend/firebaseAdmin.js
import admin from "firebase-admin";

// --- lazy init so OPTIONS/preflight can't crash ---
let initialized = false;

function ensureInitialized() {
  if (initialized || admin.apps.length) { initialized = true; return; }

  try {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) {
      const creds = JSON.parse(sa);
      if (!creds.client_email || !creds.private_key) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT missing client_email/private_key");
      }
      admin.initializeApp({ credential: admin.credential.cert(creds) });
      initialized = true;
      return;
    }

    // No inline creds — still create a default app so imports won't crash.
    // (If no ADC is present, actual DB calls will fail at use-time, not import-time.)
    admin.initializeApp();
    initialized = true;
  } catch (e) {
    console.error("firebase-admin init failed (will fall back to default app):", e);
    if (!admin.apps.length) {
      try { admin.initializeApp(); initialized = true; }
      catch { /* leave uninitialized; callers can handle */ }
    }
  }
}

// Export *functions* so handlers can call them after method checks
export function getAdmin() {
  ensureInitialized();
  return admin;
}
export function getDb() {
  ensureInitialized();
  return admin.firestore();
}
export function getAuth() {
  ensureInitialized();
  return admin.auth();
}
export const FieldValue = admin.firestore.FieldValue;
export default admin;
