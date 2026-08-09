"use client";

// /join - JOIN THE TRIBE. True SOULPRINT brand: royal blue + gold, Impact.
// Self-contained styling - independent of the event site's look.

import { useState } from "react";

const BLUE = "#19189A";
const GOLD = "#E5E630";
const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function join(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please tell us your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
    setBusy(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const wrap = {
    minHeight: "100vh",
    background: BLUE,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 22px 80px",
    fontFamily: "Arial, Helvetica, sans-serif",
  };
  const h1 = {
    fontFamily: IMPACT,
    color: GOLD,
    fontSize: "clamp(3rem, 13vw, 4.6rem)",
    lineHeight: 0.95,
    letterSpacing: 1,
    textAlign: "center",
    margin: "18px 0 10px",
    textTransform: "uppercase",
  };
  const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    fontSize: "1.05rem",
    borderRadius: 12,
    border: "3px solid " + GOLD,
    background: "#100f6e",
    color: "#ffffff",
    outline: "none",
    marginTop: 6,
  };
  const label = {
    display: "block",
    marginTop: 18,
    color: GOLD,
    fontFamily: IMPACT,
    letterSpacing: 2,
    fontSize: "0.95rem",
    textTransform: "uppercase",
  };

  if (done) {
    return (
      <main style={wrap}>
        <img src="/SOULPRINT%20LOGO_YELLOW_V2.png" alt="SOULPRINT" style={{ width: 120, height: "auto", marginTop: 10 }} />
        <h1 style={h1}>Welcome,<br />{name.split(" ")[0]}</h1>
        <p style={{ color: "#fff", fontSize: "1.15rem", textAlign: "center", maxWidth: 440 }}>
          You are in the tribe now.
        </p>
        <div style={{ maxWidth: 440, width: "100%", background: "#100f6e", border: "3px solid " + GOLD, borderRadius: 18, padding: "22px 20px", marginTop: 18 }}>
          <p style={{ margin: 0, color: GOLD, fontFamily: IMPACT, letterSpacing: 2, textTransform: "uppercase" }}>Check your email</p>
          <p style={{ margin: "10px 0 0", color: "#fff", lineHeight: 1.5 }}>
            We just sent you a welcome note with the invite to our Discord -
            that is where the tribe lives between gatherings. Open it and come through.
          </p>
          <p style={{ margin: "10px 0 0", color: "#b9b8f5", fontSize: "0.9rem" }}>
            Nothing arriving? Check spam, and mark us as safe.
          </p>
        </div>
        <p style={{ color: "#b9b8f5", marginTop: 28, fontStyle: "italic" }}>
          Walk in a stranger. Leave with a tribe.
        </p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <img src="/SOULPRINT%20LOGO_YELLOW_V2.png" alt="SOULPRINT" style={{ width: 120, height: "auto", marginTop: 10 }} />
      <h1 style={h1}>Join<br />The Tribe</h1>
      <p style={{ color: "#fff", fontSize: "1.1rem", textAlign: "center", maxWidth: 420, margin: "0 0 6px" }}>
        You found us. That was not an accident.
      </p>
      <p style={{ color: "#b9b8f5", textAlign: "center", maxWidth: 420, lineHeight: 1.55, margin: "10px 0 0" }}>
        We are artists, creators, and souls building a world rooted in community.
        Leave your email and we will send you the invite to our Discord - where
        the tribe lives between gatherings - plus first word on everything we create.
      </p>

      <form onSubmit={join} style={{ width: "100%", maxWidth: 440, marginTop: 10 }}>
        <label style={label} htmlFor="name">Your name</label>
        <input style={input} id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />

        <label style={label} htmlFor="email">Email</label>
        <input style={input} id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

        {error && (
          <p style={{ background: "#e0403f", color: "#fff", padding: "12px 14px", borderRadius: 12, fontWeight: 700, marginTop: 16 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "16px",
            background: GOLD,
            color: BLUE,
            border: "none",
            borderRadius: 14,
            fontFamily: IMPACT,
            fontSize: "1.4rem",
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 5px 0 #0d0c55",
          }}
        >
          {busy ? "Welcoming you in..." : "Join The Tribe"}
        </button>
        <p style={{ color: "#b9b8f5", textAlign: "center", marginTop: 14, fontSize: "0.9rem" }}>
          No spam, no noise. Just the tribe.
        </p>
      </form>

      <p style={{ color: "#b9b8f5", marginTop: 26, fontSize: "0.95rem" }}>
        Want to water the vision too?{" "}
        <a href="/fund" style={{ color: GOLD, fontWeight: 700 }}>Fund the tribe</a>
      </p>
    </main>
  );
}
