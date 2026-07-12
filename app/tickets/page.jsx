"use client";

// /tickets - THE revenue-critical page. Fast, no journey, no friction.
// This is the QR-at-the-door destination for walk-up sales.

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT } from "@/lib/config";
import FlagBreak from "@/components/FlagBreak";

export default function TicketsPage() {
  const [tiers, setTiers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((d) => {
        setTiers(d.tiers);
        const firstAvailable = d.tiers.find((t) => t.remaining > 0);
        if (firstAvailable) setSelected(firstAvailable.id);
      })
      .catch(() => setError("Could not load ticket availability - refresh to retry."));
  }, []);

  async function buy(e) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Pick a ticket tier first.");
    if (!name.trim()) return setError("Please tell us your name - it goes on your ticket.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email - your QR ticket is sent there.");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selected, quantity: qty, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)" }}>Get Tickets</h1>
      <p className="center mt-1">
        <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
        {EVENT.venueName} · {EVENT.venueAddress}
      </p>
      <FlagBreak />

      {!tiers && !error && <p className="center mt-3">Loading tickets...</p>}

      {tiers && (
        <form onSubmit={buy}>
          <div style={{ display: "grid", gap: 14 }}>
            {tiers.map((t) => {
              const soldOut = t.remaining <= 0;
              const active = selected === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => !soldOut && setSelected(t.id)}
                  disabled={soldOut}
                  className="card"
                  style={{
                    textAlign: "left",
                    cursor: soldOut ? "not-allowed" : "pointer",
                    opacity: soldOut ? 0.5 : 1,
                    borderColor: active ? "var(--sun-yellow)" : undefined,
                    borderWidth: active ? 3 : 2,
                    background: active ? "rgba(245,232,41,0.18)" : undefined,
                    color: "inherit",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="label" style={{ fontSize: "1.15rem" }}>{t.name}</span>
                    <span className="label" style={{ fontSize: "1.3rem" }}>{t.priceLabel}</span>
                  </div>
                  <p className="muted mt-1">{t.blurb}</p>
                  {soldOut ? (
                    <p style={{ color: "var(--ribbon-red)", fontWeight: 700 }} className="mt-1">SOLD OUT</p>
                  ) : t.remaining <= 15 ? (
                    <p style={{ color: "var(--sun-yellow)", fontWeight: 700 }} className="mt-1">
                      Only {t.remaining} left
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          <label htmlFor="qty">How many tickets?</label>
          <select id="qty" value={qty} onChange={(e) => setQty(parseInt(e.target.value, 10))}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>

          <label htmlFor="name">Your name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />

          <label htmlFor="email">Email (your QR ticket lands here)</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

          {error && (
            <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn glow mt-3" style={{ width: "100%", fontSize: "1.2rem" }} disabled={busy}>
            {busy ? "Opening secure checkout..." : "Continue to payment"}
          </button>
          <p className="muted center mt-2">
            Secure checkout by Stripe. No hidden fees - the price you see is the price you pay.<br />
            Tickets are transferable · no refunds.
          </p>
        </form>
      )}
    </main>
  );
}
