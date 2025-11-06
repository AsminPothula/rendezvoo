// api/index.js
import serverless from "serverless-http";
import app from "../backend/app.js";

export const config = { runtime: "nodejs" };
export default serverless(app);
