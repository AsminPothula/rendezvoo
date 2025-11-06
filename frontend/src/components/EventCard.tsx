// frontend/src/components/EventCard.tsx

type Event = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  date?: string;     // "YYYY-MM-DD"
  time?: string;     // "HH:mm"
  city?: string;
  venue?: string;
  capacity?: number;

  // Backends vary: support both keys gracefully
  registeredCount?: number;
  registrationsCount?: number;

  tags?: string[];
};

export default function EventCard({
  ev,
  onRegister,
  onUnregister,
  onOpen,
}: {
  ev: Partial<Event> & { id: string };
  onRegister?: (ev: Event) => void | Promise<void>;
  onUnregister?: (ev: Event) => void | Promise<void>;
  onOpen?: (ev: Event) => void | Promise<void>;
}) {
  // Safe fallbacks so nothing throws
  const title = ev.title ?? "Untitled event";
  const description = String(ev.description ?? "");
  const category = ev.category ?? "Event";
  const date = ev.date ?? "";
  const time = ev.time ?? "";
  const city = ev.city ?? "";
  const venue = ev.venue ?? "";
  const tags = Array.isArray(ev.tags) ? ev.tags : [];

  // Normalize counts (prefer registeredCount, else registrationsCount)
  const capacity = Number.isFinite(Number(ev.capacity)) ? Number(ev.capacity) : 0;
  const regRaw =
    ev.registeredCount ??
    ev.registrationsCount ??
    0;
  const registered = Number.isFinite(Number(regRaw)) ? Number(regRaw) : 0;
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - registered) : 0;

  const prettyDate =
    date && time ? new Date(`${date}T${time}:00`).toLocaleString() :
    date ? new Date(`${date}T00:00:00`).toLocaleDateString() :
    "";

  const shortDesc = description.length > 140 ? description.slice(0, 137) + "…" : description;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className="badge">{category}</span>
      </div>

      <div className="kicker" style={{ marginBottom: 8 }}>
        {prettyDate && <>{prettyDate} · </>}
        {city && <>{city}</>}
        {city && venue && " · "}
        {venue && <>{venue}</>}
      </div>

      {shortDesc && <p style={{ marginTop: 0 }}>{shortDesc}</p>}

      {tags.length > 0 && (
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {tags.slice(0, 4).map((t) => (
            <span key={t} className="badge">{t}</span>
          ))}
        </div>
      )}

      <div className="row" style={{ justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
        <div className="kicker">
          {capacity > 0 ? (
            <>Capacity {capacity} · {registered} registered · {spotsLeft} left</>
          ) : (
            <>Open capacity · {registered} registered</>
          )}
        </div>

        <div className="row" style={{ gap: 8 }}>
          {onRegister && (
            <button className="btn" onClick={() => onRegister(ev as Event)}>
              Register
            </button>
          )}
          {onUnregister && (
            <button className="btn ghost" onClick={() => onUnregister(ev as Event)}>
              Unregister
            </button>
          )}
          {!onRegister && onOpen && (
            <button className="btn" onClick={() => onOpen(ev as Event)}>
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
