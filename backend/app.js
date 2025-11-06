// backend/app.js
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// ---------- CORS (before any routes) ----------
const raw = (process.env.ALLOWED_ORIGIN || "").trim();
const allowList = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];

const matchOrigin = (origin, pattern) => {
  if (!origin || !pattern) return false;
  if (pattern.includes("*")) {
    const re = new RegExp("^" + pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace("\\*", ".*") + "$");
    return re.test(origin);
  }
  return origin === pattern;
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  let allowed = false;

  if (!origin) allowed = true;                 // curl/server-to-server
  else if (allowList.length === 0) allowed = true;  // permissive if unset
  else allowed = allowList.some(p => matchOrigin(origin, p));

  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
// ----------------------------------------------

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, allowedOrigin: raw || "(permissive)" });
});

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
