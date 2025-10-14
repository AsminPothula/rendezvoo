import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

type AppUser = { id: string; role?: 'attendee'|'organizer'|'speaker' } | null;

export default function Events({ user }:{ user: AppUser }){
  const [items,setItems] = useState<any[]>([]);
  const [q,setQ] = useState("");
  const [cat,setCat] = useState("");

  const load = async ()=>{
    const params = new URLSearchParams();
    params.set("published","true");
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const res = await apiFetch(`/api/events?${params.toString()}`);
    setItems(await res.json());
  };
  useEffect(()=>{ load(); },[]);

  const register = async (ev:any)=>{
    if (!user) return alert("Please login first");
    const headers: HeadersInit = {
      "Content-Type":"application/json",
      ...(await authHeaders()),
    };
    const res = await apiFetch(`/api/events/${ev.id}/register`,{
      method:"POST",
      headers
    });
    if(!res.ok){
      const { error } = await res.json().catch(()=>({error:"Registration failed"}));
      return alert(error || "Registration failed");
    }
    await load();
    alert("Registered!");
  };

  return (
    <div className="container">
      <div className="row" style={{justifyContent:"space-between", marginBottom:12}}>
        <h2>Explore Events</h2>
        <div className="row" style={{gap:8}}>
          <input className="input" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All categories</option>
            <option>Meetup</option>
            <option>Workshop</option>
            <option>Festival</option>
            <option>Talk</option>
          </select>
          <button className="btn" onClick={load}>Filter</button>
        </div>
      </div>
      <div className="grid cols-3">
        {items.map(ev => (
          <EventCard key={ev.id} ev={ev} onRegister={register} />
        ))}
      </div>
    </div>
  );
}
