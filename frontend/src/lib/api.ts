// frontend/src/lib/api.ts
const RAW = (import.meta.env.VITE_API_BASE ?? "").trim();
export const API_BASE = RAW.endsWith("/") ? RAW.slice(0, -1) : RAW;

if (!API_BASE && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn("[api] VITE_API_BASE is empty; requests will be relative to the frontend origin");
}

function join(base: string, path: string) {
  if (!base) return path;                     // fallback: relative (usually wrong for this app)
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = /^https?:\/\//i.test(path) ? path : join(API_BASE, path);
  return fetch(url, init);
}
