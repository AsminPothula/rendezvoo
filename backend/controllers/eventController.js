import { adminDb, FieldValue } from "../firebaseAdmin.js";

/** GET /api/events?q=&category=&city=&published=true */
export async function listEvents(req, res) {
  try {
    const { q, category, city, published } = req.query;
    let ref = adminDb.collection("events");
    if (published !== undefined) ref = ref.where("published", "==", String(published) === "true");

    const snap = await ref.get();
    let items = snap.docs.map(d => ({ id: d.id, ...d.data(), registrationsCount: d.data().registrationsCount || 0 }));

    if (category) items = items.filter(e => (e.category || "").toLowerCase() === String(category).toLowerCase());
    if (city)     items = items.filter(e => (e.city || "").toLowerCase() === String(city).toLowerCase());
    if (q) {
      const k = String(q).toLowerCase();
      items = items.filter(e => ((e.title||"") + (e.description||"") + (e.venue||"")).toLowerCase().includes(k));
    }

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "listEvents failed" });
  }
}

/** POST /api/events (organizer) */
export async function createEvent(req, res) {
  try {
    const organizerId = req.user.id;
    const body = req.body || {};
    const payload = {
      title: body.title || "Untitled",
      category: body.category || "Meetup",
      date: body.date || "",
      time: body.time || "",
      venue: body.venue || "",
      city: body.city || "",
      description: body.description || "",
      capacity: Number(body.capacity) || 50,
      organizerId,
      published: !!body.published,
      createdAt: FieldValue.serverTimestamp(),
      registrationsCount: 0,
    };
    const doc = await adminDb.collection("events").add(payload);
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "createEvent failed" });
  }
}

/** PUT /api/events/:id (organizer who owns it) */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const evRef = adminDb.collection("events").doc(id);
    const ev = await evRef.get();
    if (!ev.exists) return res.status(404).json({ error: "Not found" });
    if (ev.data().organizerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    await evRef.set({ ...req.body, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const snap = await evRef.get();
    res.json({ id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "updateEvent failed" });
  }
}

/** POST /api/events/:id/register (attendee self-register) */
export async function registerForEvent(req, res) {
  try {
    const { id } = req.params; // event id
    const uid = req.user.id;

    const evRef = adminDb.collection("events").doc(id);
    const ev = await evRef.get();
    if (!ev.exists) return res.status(404).json({ error: "Event not found" });

    // enforce capacity
    const capacity = ev.data().capacity || 0;
    const regsSnap = await evRef.collection("registrations").get();
    const count = regsSnap.size;
    if (count >= capacity) return res.status(409).json({ error: "Event is full" });

    await evRef.collection("registrations").doc(uid).set({
      status: "registered",
      createdAt: FieldValue.serverTimestamp(),
    });

    // store a rolling counter (not strictly necessary, but useful)
    await evRef.set({ registrationsCount: count + 1 }, { merge: true });

    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "registerForEvent failed" });
  }
}

/** POST /api/events/:id/checkin (organizer marks attendee checked-in) */
export async function checkinAttendee(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const evRef = adminDb.collection("events").doc(id);
    const ev = await evRef.get();
    if (!ev.exists) return res.status(404).json({ error: "Event not found" });
    if (ev.data().organizerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    await evRef.collection("registrations").doc(userId).set(
      { status: "checked-in", checkedInAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "checkinAttendee failed" });
  }
}

/** GET /api/events/mine/:uid (events a user registered for) */
export async function myEvents(req, res) {
  try {
    const { uid } = req.params;
    if (uid !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const eventsSnap = await adminDb.collection("events").get();
    const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const result = [];
    for (const e of events) {
      const reg = await adminDb.collection("events").doc(e.id)
        .collection("registrations").doc(uid).get();
      if (reg.exists) result.push(e);
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "myEvents failed" });
  }
}
