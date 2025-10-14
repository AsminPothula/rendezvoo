// frontend/src/lib/api.ts
const RAW = (import.meta.env.VITE_API_BASE ?? "").trim();
export const API_BASE = RAW.endsWith("/") ? RAW.slice(0, -1) : RAW;

function join(base: string, path: string) {
  if (!base) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = /^https?:\/\//i.test(path) ? path : join(API_BASE, path);
  return fetch(url, init);
}
