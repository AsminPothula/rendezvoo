const express = require('express');
const app = express();

app.use(express.json());

// CORS + preflights (keep yours)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = new Set(['https://rendezvoo-omega.vercel.app', 'http://localhost:3000']);
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// your route:
app.post('/api/events/:id/register', (req, res) => {
  return res.status(200).json({ ok: true, id: req.params.id, body: req.body });
});

// IMPORTANT: export a serverless handler
module.exports = (req, res) => app(req, res);
