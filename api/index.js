import serverless from "serverless-http";
import app from "../backend/app.js";
export const config = { runtime: "nodejs20" };
export default serverless(app);
