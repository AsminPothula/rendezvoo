import express from "express";
import { loginUpsert, getUser, updateUser } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = express.Router();

// All require auth
router.post("/login", verifyFirebaseToken, loginUpsert);
router.get("/:id", verifyFirebaseToken, getUser);
router.put("/:id", verifyFirebaseToken, updateUser);

export default router;
