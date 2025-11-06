// frontend/src/pages/myEvents.tsx
import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

export default function MyEvents({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const headers: HeadersInit = { ...(await authHeaders()) };
    const res = await apiFetch(`/api/events/mine/${user.id}`, { headers });
    setItems(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Optional: enable unregister from "My Events" and refresh after
  const unregister = async (ev: any) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    };
    const res = await apiFetch(`/api/events/${ev.id}/unregister`, {
      method: "POST",
      headers,
      body: "{}",
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unregister failed" }));
      return alert(error || "Unregister failed");
    }
    await load();
    alert("Unregistered.");
  };

  return (
    <div className="container">
      <h2>My Events</h2>
      {items.length === 0 && <p className="kicker">Nothing yet — register from the Events page.</p>}
      <div className="grid cols-3">
        {items.map((ev) => (
          <EventCard key={ev.id} ev={ev} onUnregister={unregister} onOpen={() => {}} />
        ))}
      </div>
    </div>
  );
}
