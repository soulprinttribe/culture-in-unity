"use client";

// /tickets - THE revenue-critical page. Fast, no journey, no friction.
// This is the QR-at-the-door destination for walk-up sales.

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT, ADDONS, TIERS } from "@/lib/config";

export default function TicketsPage() {
  const [tiers, setTiers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [foodQty, setFoodQty] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
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

  // Never let food plates exceed ticket count.
  useEffect(() => {
    setFoodQty((f) => Math.min(f, qty));
  }, [qty]);

  async function buy(e) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Pick a ticket first.");
    if (!name.trim()) return setError("Please tell us your name - it goes on your ticket.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email - your QR ticket is sent there.");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selected, quantity: qty, foodQty, name, email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const unitPrice = selected && TIERS[selected] ? TIERS[selected].price : 0;
  const total = unitPrice * qty + foodQty * ADDONS.food.price;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)" }}>Get Tickets</h1>
      <p className="center mt-1">
        <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
        {EVENT.venueName} · {EVENT.venueAddress}
      </p>
      <div className="ribbon mt-2 mb-2" />

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
                  ) : null}
                </button>
              );
            })}
          </div>

          <label htmlFor="qty">How many tickets?</label>
          <select id="qty" value={qty} onChange={(e) => setQty(parseInt(e.target.value, 10))}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>

          <div className="card mt-3" style={{ borderStyle: "dashed" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="label" style={{ fontSize: "1.05rem" }}>Add a food plate</span>
              <span className="label" style={{ fontSize: "1.05rem" }}>{ADDONS.food.priceLabel} each</span>
            </div>
            <p className="muted mt-1">{ADDONS.food.blurb}</p>
            <label htmlFor="foodQty" className="mt-1">How many plates?</label>
            <select id="foodQty" value={foodQty} onChange={(e) => setFoodQty(parseInt(e.target.value, 10))}>
              {Array.from({ length: qty + 1 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n === 0 ? "No plate" : n}</option>
              ))}
            </select>
          </div>

          <label htmlFor="name">Your name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />

          <label htmlFor="email">Email (your QR ticket lands here)</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

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

          <p className="center mt-3 label" style={{ fontSize: "1.25rem" }}>
            Total: ${(total / 100).toFixed(2)}
          </p>

          <button type="submit" className="btn glow mt-1" style={{ width: "100%", fontSize: "1.2rem" }} disabled={busy}>
            {busy ? "Opening secure checkout..." : "Continue to payment"}
          </button>
          <p className="muted center mt-2">
            Secure checkout by Stripe. No hidden fees - the price you see is the price you pay.<br />
            Have a code? You can enter it on the next screen.
          </p>
        </form>
      )}
    </main>
  );
}
