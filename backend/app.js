// backend/app.js
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/**
 * Allow one or more origins via env, e.g.
 * ALLOWED_ORIGIN="https://rendezvoo-omega.vercel.app,https://rendezvoo-omega-git-*.vercel.app"
 * If empty, be permissive (useful while debugging).
 */
const raw = (process.env.ALLOWED_ORIGIN || "").trim();
const allowList = raw
  ? raw.split(",").map(s => s.trim()).filter(Boolean)
  : []; // empty list => permissive for now

const originFn = (origin, cb) => {
  // server-to-server / curl without Origin
  if (!origin) return cb(null, true);

  // permissive during testing if no ALLOWED_ORIGIN provided
  if (allowList.length === 0) return cb(null, true);

  // exact matches OR support simple wildcard like https://foo-git-*.vercel.app
  const ok = allowList.some(pat => {
    if (pat.includes("*")) {
      const re = new RegExp("^" + pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\*", ".*") + "$");
      return re.test(origin);
    }
    return origin === pat;
  });

  // never throw – just disallow
  return cb(null, ok);
};

const corsOpts = {
  origin: originFn,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOpts));
// ensure every preflight gets a 200 with CORS headers
app.options("*", cors(corsOpts), (_req, res) => res.sendStatus(200));

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
