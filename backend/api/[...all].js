// Catch-all so *every* /api/* route (including OPTIONS) hits Express
import app from "../app.js";

export default function handler(req, res) {
  return app(req, res);
}
