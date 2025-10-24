// frontend/src/lib/authHeader.ts
import { auth } from "./firebase";

/** Returns { Authorization: 'Bearer <idToken>' } or {} */
export async function authHeaders(): Promise<Record<string, string>> {
  try {
    // If auth hasn't finished initializing, wait one tick
    if (!auth?.currentUser) {
      await new Promise(r => setTimeout(r, 0));
    }

    const user = auth?.currentUser;
    if (!user) return {};

    // Get cached token; caller can force refresh on 401 if needed
    const token = await user.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
