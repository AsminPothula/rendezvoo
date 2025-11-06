// app.js
const express = require('express');
const cors = require('cors');

const app = express();

// JSON body parsing (POST/PUT/PATCH need this)
app.use(express.json());

// CORS — set exact origins you use
app.use(cors({
  origin: ['https://rendezvoo-omega.vercel.app', 'http://localhost:3000'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true
}));
app.options('*', cors()); // handle all preflights

// --- your real route(s) ---
// Example: the one you’ve been calling
app.options('/api/events/:id/register', (req, res) => res.sendStatus(204));
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    // ... your logic here ...
    res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Optional: root GET so you can sanity-check deploy without a health path
app.get('/', (req, res) => res.status(200).send('rendezvoo backend up'));

module.exports = app; // <-- critical for Vercel
