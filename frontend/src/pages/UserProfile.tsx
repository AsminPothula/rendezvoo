import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { authHeaders } from "../lib/authHeader";

export default function UserProfile({ user, setUser }:{ user:any; setUser:(u:any)=>void }){
  const [me,setMe] = useState<any>(user);

  useEffect(()=>{ (async()=>{
    if(!user) return;
    const headers: HeadersInit = { ...(await authHeaders()) };
    const res = await apiFetch(`/api/users/${user.id}`, { headers });
    if(res.ok) setMe(await res.json());
  })(); },[user]);

  const save = async ()=>{
    const headers: HeadersInit = {
      "Content-Type":"application/json",
      ...(await authHeaders()),
    };
    const res = await apiFetch(`/api/users/${user.id}`,{
      method:"PUT", headers,
      body: JSON.stringify({ name: me.name, bio: me.bio, avatarUrl: me.avatarUrl })
    });
    if(!res.ok) return alert("Save failed");
    const updated = await res.json();
    setUser(updated);
    alert("Saved!");
  };

  if(!user) return <div className="container"><p className="kicker">Please login first.</p></div>;
  return (
    <div className="container">
      <h2>Account</h2>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div className="card">
          <h3>Profile</h3>
          <div className="grid" style={{gap:10}}>
            <label className="kicker">Name</label>
            <input className="input" value={me?.name||""} onChange={e=>setMe({...me,name:e.target.value})}/>
            <label className="kicker">Bio</label>
            <textarea className="input" rows={4} value={me?.bio||""} onChange={e=>setMe({...me,bio:e.target.value})}></textarea>
            <label className="kicker">Avatar URL</label>
            <input className="input" value={me?.avatarUrl||""} onChange={e=>setMe({...me,avatarUrl:e.target.value})}/>
            <button className="btn" onClick={save}>Save</button>
          </div>
        </div>
        <div className="card">
          <h3>Stats</h3>
          <p className="kicker">Registered: {me?.stats?.registered||0} · Checked-in: {me?.stats?.checkedIn||0}</p>
          <p className="kicker">Role: {me?.role}</p>
        </div>
      </div>
    </div>
  );
}
