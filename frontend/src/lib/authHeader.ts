// frontend/src/lib/authHeader.ts
import { auth } from "./firebase";

/** Returns { Authorization: 'Bearer <idToken>' } or {} */
export async function authHeaders(): Promise<Record<string, string>> {
  try {
    // wait a tick if auth hasn't finished loading the current user
    if (!auth?.currentUser) {
      await new Promise((r) => setTimeout(r, 0));
    }

    const user = auth?.currentUser;
    if (!user) return {};

    const token = await user.getIdToken(); // cached Firebase ID token
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
