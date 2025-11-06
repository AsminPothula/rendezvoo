// app.js  — minimal crash-proof serverless Express
const express = require('express');

const app = express();
app.disable('x-powered-by');

// Body parser
app.use(express.json({ limit: '1mb' }));

// CORS (no external deps; short-circuit OPTIONS)
const ALLOWED = new Set([
  'https://rendezvoo-omega.vercel.app',
  'http://localhost:3000'
]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- Your endpoint (keep it trivial first) ----
app.post('/api/events/:id/register', async (req, res, next) => {
  try {
    // TEMP: do nothing fancy; just echo to prove it's working
    res.status(200).json({ ok: true, id: req.params.id, body: req.body });
  } catch (err) { next(err); }
});

// Optional root
app.get('/', (req, res) => res.status(200).send('rendezvoo backend up'));

// Global error handler so nothing crashes the function silently
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: err.message });
});

// Vercel serverless export (NOT app.listen)
module.exports = (req, res) => app(req, res);
