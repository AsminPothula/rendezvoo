// backend/api/events/mine/[userId].js
import { db } from '../../../lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const userId = String(req.query.userId);

  try {
    // TODO: authorize that the caller is this userId (or is admin)
    const regsQS = await db.collection('registrations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const eventIds = regsQS.docs.map(d => d.get('eventId')).filter(Boolean);

    if (eventIds.length === 0) return res.status(200).json([]);

    // Batch fetch events
    const eventRefs = eventIds.map(id => db.collection('events').doc(id));
    const eventSnaps = await Promise.all(eventRefs.map(ref => ref.get()));
    const events = eventSnaps
      .filter(s => s.exists)
      .map(s => ({ id: s.id, ...s.data() }));

    return res.status(200).json(events);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server error', detail: e.message });
  }
}
