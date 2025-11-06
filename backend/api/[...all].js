// Wrap the Express app for Vercel Serverless
import app from "../app.js";

// Vercel will call this with (req, res). Express apps are request handlers, so:
export default app;
