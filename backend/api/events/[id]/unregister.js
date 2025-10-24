import { db, FieldValue } from '../../../lib/firebaseAdmin.js';

const ORIGIN = 'https://rendezvoo-omega.vercel.app';
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-user-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

async function getUserIdFromRequest(req) {
  const uid = req.headers['x-user-id'];
  return typeof uid === 'string' && uid.trim() ? uid.trim() : null;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'OPTIONS, POST');
    return res.status(405).end('Method Not Allowed');
  }

  const eventId = String(req.query.id);
  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ ok: false, error: 'Unauthenticated' });

  try {
    const result = await db.runTransaction(async (tx) => {
      const eventRef = db.collection('events').doc(eventId);
      const regRef = db.collection('registrations').doc(`${eventId}_${userId}`);

      const [eventSnap, regSnap] = await Promise.all([tx.get(eventRef), tx.get(regRef)]);
      if (!eventSnap.exists) throw new Error('EVENT_NOT_FOUND');
      if (!regSnap.exists) return { status: 'not-registered' };

      tx.delete(regRef);
      tx.update(eventRef, { registeredCount: FieldValue.increment(-1) });

      const event = eventSnap.data();
      const capacity = Number(event.capacity ?? 0);
      const registeredCount = Number(event.registeredCount ?? 0);
      const seatsLeft = Math.max(0, capacity - Math.max(0, registeredCount - 1));

      return { status: 'unregistered', seatsLeft };
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    if (e.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    return res.status(500).json({ ok: false, error: 'Server error', detail: e.message });
  }
}
