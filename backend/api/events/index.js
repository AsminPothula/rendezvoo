// Handles /api/events (GET, POST, OPTIONS)
import app from "../../app.js";
export default function handler(req, res) {
  return app(req, res);
}
