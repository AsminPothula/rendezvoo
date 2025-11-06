// api/hello.js
export const config = { runtime: "nodejs" }; // <-- not nodejs20

export default function handler(req, res) {
  res.status(200).json({ ok: true, route: "/api/hello" });
}
