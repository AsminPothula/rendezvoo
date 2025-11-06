// backend/app.js
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/**
 * ALLOWED_ORIGIN can be a single origin or comma-separated list, e.g.:
 *   https://rendezvoo-omega.vercel.app,
 *   https://rendezvoo-omega-git-*.vercel.app
 */
const raw = (process.env.ALLOWED_ORIGIN || "").trim();
const allowList = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];

const matchOrigin = (origin, pattern) => {
  if (!pattern) return false;
  if (pattern.includes("*")) {
    const re = new RegExp("^" + pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace("\\*", ".*") + "$");
    return re.test(origin);
  }
  return origin === pattern;
};

const corsOrigin = (origin, cb) => {
  if (!origin) return cb(null, true);       // curl / server-to-server
  if (allowList.length === 0) return cb(null, true); // permissive if unset
  const ok = allowList.some(p => matchOrigin(origin, p));
  cb(null, ok);
};

// ---- CORS must be FIRST ----
app.use((req, res, next) => {
  res.header("Vary", "Origin"); // ensure CDN caches by Origin
  next();
});

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// Handle ALL preflights with headers
app.options("*", cors({ origin: corsOrigin, credentials: true }), (_req, res) => {
  res.sendStatus(204);
});
// ----------------------------

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
