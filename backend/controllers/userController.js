import { adminDb, FieldValue } from "../firebaseAdmin.js";

/** Upsert the user's profile in Firestore (requires auth) */
export async function loginUpsert(req, res) {
  try {
    const uid = req.user.id;
    const { name, role } = req.body || {};
    const docRef = adminDb.collection("users").doc(uid);
    await docRef.set(
      {
        name: name ?? req.user.name ?? null,
        email: req.user.email ?? null,
        role: role || "attendee",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const snap = await docRef.get();
    res.json({ id: uid, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "loginUpsert failed" });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ error: "Forbidden" });
    const snap = await adminDb.collection("users").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    res.json({ id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "getUser failed" });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ error: "Forbidden" });
    const { name, bio, avatarUrl } = req.body || {};
    const ref = adminDb.collection("users").doc(id);
    await ref.set({ name, bio, avatarUrl, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const snap = await ref.get();
    res.json({ id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "updateUser failed" });
  }
}
