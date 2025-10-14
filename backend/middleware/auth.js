import { adminAuth, adminDb } from "../firebaseAdmin.js";

/**
 * Verifies Firebase ID token and attaches req.user = { id, email, name, role }
 */
export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await adminAuth.verifyIdToken(token);
    const baseUser = { id: decoded.uid, email: decoded.email || null, name: decoded.name || null };

    // fetch role from Firestore users/{uid} if present
    let role = "attendee";
    const uDoc = await adminDb.collection("users").doc(baseUser.id).get();
    if (uDoc.exists && uDoc.data()?.role) role = uDoc.data().role;

    req.user = { ...baseUser, role };
    next();
  } catch (e) {
    console.error("verifyFirebaseToken failed:", e);
    res.status(401).json({ error: "Invalid token" });
  }
}

/** Require organizer role */
export function requireOrganizer(req, res, next) {
  if (req.user?.role === "organizer") return next();
  return res.status(403).json({ error: "Organizer role required" });
}
