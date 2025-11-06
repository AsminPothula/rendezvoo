export const config = { runtime: "nodejs20" };
export default (req, res) => res.status(200).json({ ok: true, route: "/api/hello" });
