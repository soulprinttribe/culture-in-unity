"use client";

// /tickets - kept at this path so every flyer, QR and old link still lands.
// There is no ticket. This is a free gathering: RSVP only.

import { useState } from "react";
import Link from "next/link";
import { EVENT, BRING } from "@/lib/config";

export default function RsvpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bringing, setBringing] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please tell us your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
    setBusy(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, bringing, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="container center" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 560 }}>
        <h1 style={{ fontSize: "clamp(2rem, 7vw, 3rem)" }}>See You There</h1>
        <div className="ribbon mt-2 mb-2" />
        <p className="mt-2">You are on the list, {name.split(" ")[0]}. We will send you the details before the day.</p>
        <div className="card mt-3" style={{ textAlign: "left" }}>
          <h3>{EVENT.dateLabel} &middot; {EVENT.timeLabel}</h3>
          <p className="mt-1">{EVENT.venueName}<br />{EVENT.venueAddress}</p>
          <p className="mt-2"><strong>Bring:</strong> {BRING.join(" · ")}</p>
        </div>
        <p className="mt-3">The best thing you can do now is bring someone with you.</p>
        <p className="mt-3"><Link href="/" className="btn secondary">Back to the portal</Link></p>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)" }}>Come Through</h1>
      <p className="center mt-1">
        <strong>{EVENT.dateLabel} &middot; {EVENT.timeLabel}</strong><br />
        {EVENT.venueName}<br />
        {EVENT.venueAddress}
      </p>
      <div className="ribbon mt-2 mb-2" />

      <div className="card center" style={{ background: "rgba(245,232,41,0.18)" }}>
        <h2 style={{ fontSize: "1.6rem" }}>FREE &middot; NO TICKET</h2>
        <p className="mt-1">There is nothing to buy and no list at the door. Just come.</p>
        <p className="muted mt-1">Let us know you are coming and we will send you the details - where exactly to find us, and anything that changes.</p>
      </div>

      <form onSubmit={submit} className="mt-3">
        <label htmlFor="name">Your name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

        <label htmlFor="bringing">Bringing anything? (optional)</label>
        <input id="bringing" value={bringing} onChange={(e) => setBringing(e.target.value)} placeholder="A drum, my art, three friends..." />

        <label htmlFor="source">How did you hear about us?</label>
        <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">Select one (optional)</option>
          <option>Flyer / QR code</option>
          <option>Instagram</option>
          <option>Social media (stories, posts)</option>
          <option>Word of mouth</option>
          <option>Other</option>
        </select>

        {error && (
          <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn glow mt-3" style={{ width: "100%", fontSize: "1.2rem" }} disabled={busy}>
          {busy ? "Sending..." : "I will be there"}
        </button>
      </form>

      <div className="card mt-3">
        <h3>Bring</h3>
        <p className="mt-1">{BRING.join(" · ")}</p>
        <p className="muted mt-2">Come for an hour or stay for all five. However you show up is right.</p>
      </div>

      <p className="center mt-3">
        <Link href={EVENT.mapUrl}>Open the map</Link>
      </p>
    </main>
  );
}
