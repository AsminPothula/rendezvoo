// backend/app.js
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/**
 * Allow exactly the frontend origin (or multiple, comma-separated)
 * Example ALLOWED_ORIGIN:
 *   https://rendezvoo-omega.vercel.app
 *   OR for previews: https://rendezvoo-omega.vercel.app,https://rendezvoo-omega-git-*.vercel.app
 */
const allowedList = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const corsOpts = {
  origin: (origin, cb) => {
    // allow same-origin / server-to-server / curl (no origin header)
    if (!origin) return cb(null, true);
    if (allowedList.length === 0) return cb(null, true); // permissive during testing
    if (allowedList.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOpts));
// Important: explicitly handle preflight
app.options("*", cors(corsOpts));

app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
