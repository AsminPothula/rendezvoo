// backend/middleware/auth.js
import { getAuth } from "../firebaseAdmin.js";

/** Reads Firebase ID token from Authorization header if present */
export async function authOptional(req, _res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const match = hdr.match(/^Bearer\s+(.+)$/i);
    if (match) {
      const token = match[1];
      const auth = getAuth();
      const decoded = await auth.verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email || null };
    }
  } catch {
    // ignore — user stays unauthenticated
  }
  next();
}

/** Requires a valid Firebase ID token */
export async function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const match = hdr.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ ok: false, error: "Missing Authorization" });
    const token = match[1];
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || null };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}
