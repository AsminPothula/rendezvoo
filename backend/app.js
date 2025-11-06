// backend/app.js
import express from "express";

export const app = express();
app.use(express.json());

// --- CORS (works for preflight + requests) ---
const ALLOWLIST = new Set([
  "https://rendezvoo-omega.vercel.app",
  "http://localhost:3000",
  // add preview origins if you use them, e.g.:
  // "https://rendezvoo-omega-git-main-<user>.vercel.app",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWLIST.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // only if you actually use cookies
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// --- Minimal routes to verify ---
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/events", (req, res) => {
  // stub; replace with your real logic
  const published = String(req.query.published) === "true";
  res.json({ events: [], published });
});

app.get("/api/events/mine/:id", (req, res) => {
  res.json({ id: req.params.id, events: [] });
});

app.post("/api/events/:id/register", (req, res) => {
  res.status(200).json({ ok: true, id: req.params.id, body: req.body });
});

// --- Default export: serverless handler for Vercel ---
export default function handler(req, res) {
  return app(req, res);
}
