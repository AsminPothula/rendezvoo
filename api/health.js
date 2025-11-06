// api/health.js
export const config = { runtime: "nodejs" };
export default (req, res) => {
  res.status(200).json({ ok: true, route: "/api/health" });
};
