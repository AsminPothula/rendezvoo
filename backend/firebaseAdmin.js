// backend/firebaseAdmin.js
import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** ------------------------------------------------------------------
 * Safety-net: load env here too, in case server.js didn't load it yet
 * ------------------------------------------------------------------ */
try {
  // Prefer .env.local if present
  if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    if (!process.env.SILENT_ENV_LOGS) console.log('🧪 [firebaseAdmin] Loaded .env.local');
  } else if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    if (!process.env.SILENT_ENV_LOGS) console.log('🧪 [firebaseAdmin] Loaded .env');
  } else {
    if (!process.env.SILENT_ENV_LOGS) console.log('🧪 [firebaseAdmin] No .env/.env.local found at CWD');
  }
} catch { /* ignore if dotenv not installed */ }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Utility: safe shorthand logging (no secrets) */
function dbg(msg, extra = {}) {
  if (process.env.NODE_ENV === 'production') return;
  if (process.env.SILENT_ENV_LOGS) return;
  console.log(`🔎 [firebaseAdmin] ${msg}`, extra);
}

function loadCreds() {
  // 1) Inline JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    dbg('Using FIREBASE_SERVICE_ACCOUNT env', {
      length: process.env.FIREBASE_SERVICE_ACCOUNT.length,
    });
    try {
      const obj = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      // quick sanity checks
      if (!obj.client_email || !obj.private_key) {
        throw new Error('Missing client_email/private_key in FIREBASE_SERVICE_ACCOUNT');
      }
      return obj;
    } catch (e) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON (or missing fields).');
      throw e;
    }
  }

  // 2) Path env
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Resolve relative to this file (backend/)
    const abs = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    dbg('Using GOOGLE_APPLICATION_CREDENTIALS file', { abs });
    if (!fs.existsSync(abs)) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS points to missing file: ${abs}`);
    }
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  }

  // 3) Fallback default path: ./keys/serviceAccount.json (relative to backend/)
  const fallback = path.resolve(__dirname, './keys/serviceAccount.json');
  dbg('Trying fallback key path', { fallbackExists: fs.existsSync(fallback), fallback });
  if (fs.existsSync(fallback)) {
    return JSON.parse(fs.readFileSync(fallback, 'utf8'));
  }

  // Nothing found
  return null;
}

if (!admin.apps.length) {
  const creds = loadCreds();
  if (!creds) {
    console.error('❌ No Firebase Admin credentials found.');
    console.error('   Checked: FIREBASE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS, ./keys/serviceAccount.json');
    console.error('   CWD:', process.cwd());
    console.error('   __dirname (backend):', __dirname);
    throw new Error('Firebase Admin not configured. See logs above.');
  }

  admin.initializeApp({ credential: admin.credential.cert(creds) });
  dbg('Firebase Admin initialized');
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
