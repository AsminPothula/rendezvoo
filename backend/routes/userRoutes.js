// backend/routes/userRoutes.js
import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.options("/me", (_req, res) => res.sendStatus(204));

router.get("/me", authRequired, (req, res) => {
  res.json({ ok: true, user: req.user });
});

export default router;
