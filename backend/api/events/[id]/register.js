// backend/api/events/[id]/register.js
const ORIGIN = 'https://rendezvoo-omega.vercel.app';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'OPTIONS, POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { id } = req.query; // event id
    // TODO: register the attendee for event `id`
    return res.status(200).json({ ok: true, eventId: id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
