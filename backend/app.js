// backend/app.js
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/** ---- Allowed origins list (comma-separated) ----
 * Example:
 *   ALLOWED_ORIGIN="https://rendezvoo-omega.vercel.app,https://rendezvoo-omega-git-*.vercel.app"
 */
const raw = (process.env.ALLOWED_ORIGIN || "").trim();
const allowList = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];

// simple wildcard matcher (one '*' segment supported)
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

// ---- CORS: always set headers when origin is allowed, and short-circuit OPTIONS ----
app.use((req, res, next) => {
  const origin = req.headers.origin;

  let allowed = false;
  if (!origin) {
    // non-browser / curl: allow
    allowed = true;
  } else if (allowList.length === 0) {
    // permissive if not configured
    allowed = true;
  } else {
    allowed = allowList.some(p => matchOrigin(origin, p));
  }

  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    // Always return quickly to satisfy preflight
    return res.status(204).end();
  }

  next();
});
// -------------------------------------------

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    version: process.env.VERCEL_GIT_COMMIT_SHA || null,
    allowedOrigin: raw || "(empty => permissive)",
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
