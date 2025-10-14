import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/main.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Events from "./pages/Events";
import MyEvents from "./pages/MyEvents";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import UserProfile from "./pages/UserProfile";
import Login from "./components/Login";

import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Looser, friendly types
export type Role = "attendee" | "organizer" | "speaker";
export type AppUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  role?: Role; // optional
} | null;

// ---- Route guards ----
function Protected({
  user,
  init,
  children,
}: {
  user: AppUser;
  init: boolean;
  children: React.ReactElement; // works better across TS configs
}) {
  const location = useLocation();
  if (!init) return <div className="container"><p className="kicker">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function RequireOrganizer({
  user,
  init,
  children,
}: {
  user: AppUser;
  init: boolean;
  children: React.ReactElement;
}) {
  const location = useLocation();
  if (!init) return <div className="container"><p className="kicker">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user?.role !== "organizer") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState<AppUser>(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setInit(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null);
      } else {
        // Safely coerce saved role to our union (fallback to "attendee")
        const raw = localStorage.getItem("rv_role");
        const savedRole = (raw === "organizer" || raw === "speaker" || raw === "attendee") ? raw : "attendee";
        setUser({
          id: fbUser.uid,
          email: fbUser.email ?? undefined,
          displayName: fbUser.displayName ?? undefined,
          role: savedRole,
        });
      }
      setInit(true);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("rv_role");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Header user={user} onLogout={logout} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Events user={user} />} />
        <Route
          path="/login"
          element={
            init && user
              ? <Navigate to={user?.role === "organizer" ? "/organizer" : "/"} replace />
              : <Login onLogin={setUser as any} />
          }
        />

        {/* Protected */}
        <Route
          path="/my"
          element={
            <Protected user={user} init={init}>
              <MyEvents user={user} />
            </Protected>
          }
        />
        <Route
          path="/me"
          element={
            <Protected user={user} init={init}>
              <UserProfile user={user} setUser={setUser as any} />
            </Protected>
          }
        />
        <Route
          path="/organizer"
          element={
            <RequireOrganizer user={user} init={init}>
              <OrganizerDashboard user={user} />
            </RequireOrganizer>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
