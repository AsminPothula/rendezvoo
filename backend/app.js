// backend/app.js
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/* ---------- CORS first ---------- */
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
  const allowed = !origin || allowList.length === 0 || allowList.some(p => matchOrigin(origin, p));
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
/* -------------------------------- */

app.use(express.json());

/* IMPORTANT: no '/api' prefix here */
// backend/app.js (excerpt)
app.get("/health", (_req, res) => res.json({ ok: true, via: "express" }));
app.use("/events", eventRoutes);
app.use("/users", userRoutes);



export default app;
