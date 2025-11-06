// api/index.js
// Runtime-safe serverless wrapper for your Express app.
// Avoids top-level imports so the function always builds.

let cachedHandler = null;

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (!cachedHandler) {
      // Lazy-load deps at runtime to prevent build-time failures
      const [{ default: serverless }, { default: app }] = await Promise.all([
        import("serverless-http"),
        import("../backend/app.js"),
      ]);
      cachedHandler = serverless(app);
    }
    return cachedHandler(req, res);
  } catch (e) {
    // Helpful error for debugging
    res
      .status(500)
      .json({ ok: false, where: "api/index.js", error: String(e?.message || e) });
  }
}
