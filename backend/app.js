// backend/app.js
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || true; // in dev it's true; in prod set to your frontend URL
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

export default app;
