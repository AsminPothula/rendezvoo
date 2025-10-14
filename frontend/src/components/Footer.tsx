//import React from "react";
export default function Footer(){
  return (
    <footer className="container" style={{opacity:.8, paddingBottom:40}}>
      <small className="kicker">© {new Date().getFullYear()} Rendezvoo • Built for CSE 5325 </small>
    </footer>
  );
}
