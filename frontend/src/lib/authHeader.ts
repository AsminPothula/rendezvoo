// frontend/src/lib/authHeader.ts
import { auth } from "./firebase";

/** Always returns a plain object so it's assignable to HeadersInit */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await auth?.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
