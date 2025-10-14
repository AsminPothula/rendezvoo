import express from "express";
import {
  listEvents,
  createEvent,
  updateEvent,
  registerForEvent,
  checkinAttendee,
  myEvents,
} from "../controllers/eventController.js";
import { verifyFirebaseToken, requireOrganizer } from "../middleware/auth.js";

const router = express.Router();

// Public GET
router.get("/", listEvents);

// Protected
router.post("/", verifyFirebaseToken, requireOrganizer, createEvent);
router.put("/:id", verifyFirebaseToken, requireOrganizer, updateEvent);
router.post("/:id/register", verifyFirebaseToken, registerForEvent);
router.post("/:id/checkin", verifyFirebaseToken, requireOrganizer, checkinAttendee);
router.get("/mine/:uid", verifyFirebaseToken, myEvents);

export default router;
