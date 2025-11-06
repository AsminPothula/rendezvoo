// backend/routes/eventRoutes.js
import { Router } from "express";
import { getDb, FieldValue } from "../firebaseAdmin.js";
import { authOptional, authRequired } from "../middleware/auth.js";

const router = Router();

/** ----- OPTIONS helpers for specific paths (cheap no-DB) ----- */
router.options("/", (_req, res) => res.sendStatus(204));
router.options("/:id", (_req, res) => res.sendStatus(204));
router.options("/:id/register", (_req, res) => res.sendStatus(204));
router.options("/:id/unregister", (_req, res) => res.sendStatus(204));
router.options("/mine/:userId", (_req, res) => res.sendStatus(204));
/** ------------------------------------------------------------ */

/** List events */
router.get("/", authOptional, async (_req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("events").orderBy("createdAt", "desc").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/** Get a single event */
router.get("/:id", authOptional, async (req, res) => {
  try {
    const db = getDb();
    const ref = db.collection("events").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/** Register for event (idempotent) */
router.post("/:id/register", authRequired, async (req, res) => {
  const eventId = String(req.params.id);
  const uid = req.user.uid;

  try {
    const db = getDb();
    const result = await db.runTransaction(async tx => {
      const eventRef = db.collection("events").doc(eventId);
      const regRef = db.collection("registrations").doc(`${eventId}_${uid}`);

      const [eventSnap, regSnap] = await Promise.all([tx.get(eventRef), tx.get(regRef)]);
      if (!eventSnap.exists) throw new Error("EVENT_NOT_FOUND");

      const ev = eventSnap.data();
      const capacity = Number(ev.capacity ?? 0);
      const registeredCount = Number(ev.registeredCount ?? 0);

      if (regSnap.exists) {
        return { status: "already-registered", seatsLeft: Math.max(0, capacity - registeredCount) };
      }
      if (registeredCount >= capacity) throw new Error("EVENT_FULL");

      tx.set(regRef, { eventId, userId: uid, status: "registered", createdAt: FieldValue.serverTimestamp() });
      tx.update(eventRef, { registeredCount: FieldValue.increment(1) });

      return { status: "registered", seatsLeft: Math.max(0, capacity - (registeredCount + 1)) };
    });

    res.json({ ok: true, ...result });
  } catch (e) {
    if (e.message === "EVENT_NOT_FOUND") return res.status(404).json({ ok: false, error: "Event not found" });
    if (e.message === "EVENT_FULL") return res.status(409).json({ ok: false, error: "Event is full" });
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/** Unregister (idempotent) */
router.post("/:id/unregister", authRequired, async (req, res) => {
  const eventId = String(req.params.id);
  const uid = req.user.uid;

  try {
    const db = getDb();
    const result = await db.runTransaction(async tx => {
      const eventRef = db.collection("events").doc(eventId);
      const regRef = db.collection("registrations").doc(`${eventId}_${uid}`);

      const [eventSnap, regSnap] = await Promise.all([tx.get(eventRef), tx.get(regRef)]);
      if (!eventSnap.exists) throw new Error("EVENT_NOT_FOUND");
      if (!regSnap.exists) return { status: "not-registered" };

      tx.delete(regRef);
      tx.update(eventRef, { registeredCount: FieldValue.increment(-1) });
      return { status: "unregistered" };
    });

    res.json({ ok: true, ...result });
  } catch (e) {
    if (e.message === "EVENT_NOT_FOUND") return res.status(404).json({ ok: false, error: "Event not found" });
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/** Events registered by a user */
router.get("/mine/:userId", authRequired, async (req, res) => {
  const uid = req.params.userId;
  if (uid !== req.user.uid) return res.status(403).json({ ok: false, error: "Forbidden" });

  try {
    const db = getDb();
    const regs = await db.collection("registrations").where("userId", "==", uid).get();
    const eventIds = regs.docs.map(d => d.data().eventId);
    if (eventIds.length === 0) return res.json([]);

    const chunks = [];
    for (let i = 0; i < eventIds.length; i += 10) chunks.push(eventIds.slice(i, i + 10));
    const reads = await Promise.all(
      chunks.map(ids => db.getAll(...ids.map(id => db.collection("events").doc(id))))
    );
    const flat = reads.flat();
    const items = flat.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
