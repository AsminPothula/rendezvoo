import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

type AppUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  role?: "attendee" | "organizer" | "speaker";
} | null;

export default function Login({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [role, setRole] = useState<"attendee" | "organizer" | "speaker">("attendee");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  // After any successful sign-in: save role, upsert profile, update app state, then redirect
  const afterLogin = async () => {
    localStorage.setItem("rv_role", role);
    const u = auth.currentUser!;
    const headers: HeadersInit = { "Content-Type": "application/json", ...(await authHeaders()) };
    try {
      await apiFetch(`/api/users/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: u.displayName ?? "", role }),
      });
    } catch {
      /* non-blocking */
    }

    onLogin({ id: u.uid, email: u.email, displayName: u.displayName ?? undefined, role });

    // 🚦 Redirect based on role
    nav(role === "organizer" ? "/organizer" : "/", { replace: true });
  };

  // Handle redirect flow (Safari/Brave popup restrictions)
  useEffect(() => {
    (async () => {
      if (!auth) return;
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await getRedirectResult(auth);
        if (result?.user) await afterLogin();
      } catch (err: any) {
        alert(humanizeAuthError(err));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google only: try popup first; fall back to redirect if blocked/unsupported
  const withGoogle = async () => {
    if (!auth) return alert("Auth not initialized.");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await afterLogin();
    } catch (err: any) {
      const code: string = err?.code || "";
      const needsRedirect =
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        code === "auth/internal-error";
      if (needsRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      alert(humanizeAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h2>Login / Sign up</h2>
        <p className="kicker">Use your Google account. First sign-in creates your account automatically.</p>

        <label className="kicker">Role</label>
        <select
          className="input"
          value={role}
          onChange={(ev) => setRole(ev.target.value as any)}
          disabled={busy}
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
          <option value="speaker">Speaker</option>
        </select>

        <button className="btn" onClick={withGoogle} style={{ marginTop: 12 }} disabled={busy}>
          {busy ? "Working…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

/** Map Firebase Auth error codes to friendly messages */
function humanizeAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not allowed in Firebase Auth settings.";
    case "auth/popup-blocked":
      return "Popup was blocked. We’ll try a full-page redirect next time.";
    case "auth/popup-closed-by-user":
      return "Popup closed before completing sign-in.";
    case "auth/cancelled-popup-request":
      return "Popup was cancelled. Please try again.";
    default:
      return `Google sign-in failed: ${code || err?.message || "Unknown error"}`;
  }
}
