import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

type Ev = {
  id: string;
  title: string;
  category: "Meetup" | "Workshop" | "Festival" | "Talk" | string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  venue: string;
  city: string;
  capacity: number;
  description: string;
  published: boolean;
  registrationsCount?: number;
};

const BLANK: Ev = {
  id: "",
  title: "",
  category: "Meetup",
  date: "",
  time: "18:00",
  venue: "",
  city: "",
  capacity: 50,
  description: "",
  published: false,
};

export default function OrganizerDashboard({ user }: { user: any }) {
  const [list, setList] = useState<Ev[]>([]);
  const [form, setForm] = useState<Ev>({ ...BLANK });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/events");
      if (!res.ok) throw new Error(`load ${res.status}`);
      const data: Ev[] = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!user || user.role !== "organizer") {
    return (
      <div className="container">
        <p className="kicker">You must be an organizer to view this page.</p>
      </div>
    );
  }

  const startEdit = (ev: Ev) => {
    setEditingId(ev.id);
    setForm({ ...ev }); // populate form with existing data
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...BLANK });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      };
      const res = await apiFetch("/api/events", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...form, id: undefined }), // backend generates id
      });
      if (!res.ok) throw new Error(`create ${res.status}`);
      setForm({ ...BLANK });
      await load();
    } catch (err: any) {
      alert(`Failed to create: ${err?.message || "Unknown error"}`);
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      };
      const res = await apiFetch(`/api/events/${editingId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          date: form.date,
          time: form.time,
          venue: form.venue,
          city: form.city,
          capacity: form.capacity,
          description: form.description,
          published: form.published,
        }),
      });
      if (!res.ok) throw new Error(`update ${res.status}`);
      setEditingId(null);
      setForm({ ...BLANK });
      await load();
    } catch (err: any) {
      alert(`Failed to update: ${err?.message || "Unknown error"}`);
    }
  };

  const togglePublish = async (ev: Ev) => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      };
      const res = await apiFetch(`/api/events/${ev.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ published: !ev.published }),
      });
      if (!res.ok) throw new Error(`toggle ${res.status}`);
      await load();
    } catch (e: any) {
      alert(`Failed to update: ${e?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="container">
      <h2>Organizer Dashboard</h2>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* LEFT: Create / Edit form */}
        <div className="card">
          <h3>{editingId ? "Edit Event" : "Create Event"}</h3>
          {editingId && (
            <p className="kicker" style={{ marginTop: -6 }}>
              Editing: <strong>{form.title || "(untitled)"}</strong>
            </p>
          )}

          <form onSubmit={editingId ? saveEdit : create} className="grid" style={{ gap: 10 }}>
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <div className="row">
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Meetup</option>
                <option>Workshop</option>
                <option>Festival</option>
                <option>Talk</option>
              </select>

              <input
                className="input"
                type="number"
                min={0}
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </div>

            <div className="row">
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>

            <div className="row">
              <input
                className="input"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="input"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>

            <textarea
              className="input"
              rows={4}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label className="row" style={{ gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              <span className="kicker">Published</span>
            </label>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn" disabled={loading} type="submit">
                {editingId ? "Save changes" : loading ? "Saving…" : "Create"}
              </button>
              {editingId && (
                <button type="button" className="btn" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: List + actions */}
        <div className="card">
          <h3>My Events</h3>
          <div className="grid">
            {list.map((ev) => (
              <div
                key={ev.id}
                className="row"
                style={{ justifyContent: "space-between", borderBottom: "1px solid #1f2730", padding: "8px 0" }}
              >
                <div>
                  <strong>{ev.title}</strong>
                  <div className="kicker">
                    Reg: {ev.registrationsCount || 0} / {ev.capacity} · {ev.published ? "Published" : "Unpublished"}
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" onClick={() => startEdit(ev)}>
                    Edit
                  </button>
                  <button className="btn" onClick={() => togglePublish(ev)}>
                    {ev.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="kicker">No events yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
