import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void | Promise<void>;
}) {
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onLogout?.();        // supports async logout
    } finally {
      navigate("/login", { replace: true }); // always go to Login
    }
  };

  return (
    <header className="header container">
      <div className="row">
        <span className="brand">Rendezvoo</span>
        <span className="badge">discover · register · connect</span>
      </div>
      <nav className="nav">
        <Link to="/">Events</Link>
        <Link to="/my">My Events</Link>
        {user?.role === "organizer" && <Link to="/organizer">Organizer</Link>}
        {user ? (
          <>
            <Link to="/me">Account</Link>
            <a href="#" onClick={handleLogout}>Logout</a>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
