import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

export default function MyEvents({ user }:{ user:any }){
  const [items,setItems] = useState<any[]>([]);

  const load = async ()=>{
    if (!user) return;
    const headers: HeadersInit = { ...(await authHeaders()) };
    const res = await apiFetch(`/api/events/mine/${user.id}`, { headers });
    setItems(await res.json());
  };
  useEffect(()=>{ load(); },[user]);

  return (
    <div className="container">
      <h2>My Events</h2>
      {items.length===0 && <p className="kicker">Nothing yet — register from the Events page.</p>}
      <div className="grid cols-3">
        {items.map(ev => (
          <EventCard key={ev.id} ev={ev} onOpen={()=>{}} />
        ))}
      </div>
    </div>
  );
}
