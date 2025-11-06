// api/index.js
// Serverless entry for Vercel: wraps your Express app (no app.listen here)

import serverless from "serverless-http";
import app from "../backend/app.js";

// (Optional) Pin runtime for consistency
export const config = {
  runtime: "nodejs20",
  // regions: ["iad1"], // optional: pick a region close to your users
};

// Export a serverless handler Vercel can invoke
export default serverless(app);
