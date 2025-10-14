import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/**
 * ALLOWED_ORIGIN can be a single origin or comma-separated list.
 * Example:
 *   ALLOWED_ORIGIN="https://rendezvoo-omega.vercel.app"
 *   ALLOWED_ORIGIN="https://rendezvoo-omega.vercel.app,https://rendezvoo-omega-git-*.vercel.app"
 */
const raw = (process.env.ALLOWED_ORIGIN || "").trim();
const allowList = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];

// exact or wildcard matcher (supports a single * segment)
const matchOrigin = (origin, pattern) => {
  if (pattern.includes("*")) {
    const re = new RegExp("^" + pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace("\\*", ".*") + "$");
    return re.test(origin);
  }
  return origin === pattern;
};

const corsOpts = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                  // server-to-server / curl
    if (allowList.length === 0) return cb(null, true);   // permissive during testing
    const ok = allowList.some(p => matchOrigin(origin, p));
    return cb(null, ok);                                  // never throw
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOpts));
// ensure all preflights get 200 + proper headers
app.options("*", cors(corsOpts), (_req, res) => res.sendStatus(200));

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
