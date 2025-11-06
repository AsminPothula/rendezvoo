// backend/app.js
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/** ---------- Ultra-early CORS + OPTIONS short-circuit ---------- */
app.use((req, res, next) => {
  // vary by origin so caches don’t mix responses
  res.header("Vary", "Origin");

  const origin = req.headers.origin;
  const allowList = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const allow =
    !origin ||
    allowList.length === 0 ||
    allowList.some(p =>
      p.includes("*")
        ? new RegExp("^" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\*", ".*") + "$").test(origin)
        : p === origin
    );

  if (allow && origin) res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204); // <- never touches DB
  next();
});
/** -------------------------------------------------------------- */

app.use(express.json());
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    version: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    allowedOrigin: process.env.ALLOWED_ORIGIN || "(unset)",
  })
);

// Mount routes (these can safely import lazy getDb/getAuth)
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
