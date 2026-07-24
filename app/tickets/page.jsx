"use client";

// /tickets - THE revenue-critical page. Fast, no journey, no friction.
// This is the QR-at-the-door destination for walk-up sales.

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT } from "@/lib/config";
import FlagBreak from "@/components/FlagBreak";

// Show ONLY Early Bird while it still has tickets. Once Early Bird sells out,
// reveal the other tiers (GA, GA + Food).
function visibleTiers(list) {
  if (!list || !list.length) return [];
  const eb = list.find((t) => t.id === "early_bird");
  if (eb && eb.remaining > 0) return [eb];
  return list.filter((t) => t.id !== "early_bird");
}

export default function TicketsPage() {
  const [tiers, setTiers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [referral, setReferral] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((d) => {
        setTiers(d.tiers);
        const firstAvailable = visibleTiers(d.tiers).find((t) => t.remaining > 0);
        if (firstAvailable) setSelected(firstAvailable.id);
      })
      .catch(() => setError("Could not load ticket availability - refresh to retry."));
  }, []);

  // Optional convenience: a partner can share /tickets?ref=VIBEFEST and it pre-fills
  // the code. It stays visible and editable, so attribution is still deliberate.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const r = p.get("ref") || p.get("code");
      if (r) setReferral(r.toUpperCase().replace(/[^A-Z0-9]/g, ""));
    } catch (e) {}
  }, []);

  async function buy(e) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Pick a ticket tier first.");
    if (!name.trim()) return setError("Please tell us your name - it goes on your ticket.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email - your QR ticket is sent there.");
    setBusy(true);
    // A typed partner/referral code is the strongest attribution signal, so it wins
    // over the general "how did you hear" dropdown when present.
    const code = referral.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const attribution = code ? code : source;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selected, quantity: qty, name, email, source: attribution }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const shown = visibleTiers(tiers);

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)", fontFamily: "var(--font-label), Impact, 'Arial Narrow Bold', sans-serif" }}>Get Tickets</h1>
      <p className="center mt-1">
        <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
        {EVENT.venueName} · {EVENT.venueAddress}
      </p>
      <FlagBreak canvasStyle={{ height: 140 }} />

      {!tiers && !error && <p className="center mt-3">Loading tickets...</p>}

      {tiers && (
        <form onSubmit={buy}>
          <div style={{ display: "grid", gap: 14 }}>
            {shown.map((t) => {
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

          <label htmlFor="source">How did you hear about us?</label>
          <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Select one (optional)</option>
            <option>Flyer / QR code</option>
            <option>Instagram</option>
            <option>Social media (stories, posts)</option>
            <option>Word of mouth</option>
            <option>Other</option>
          </select>

          <label htmlFor="referral">Partner / referral code (optional)</label>
          <input
            id="referral"
            value={referral}
            onChange={(e) => setReferral(e.target.value.toUpperCase())}
            placeholder="e.g. VIBEFEST"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="muted" style={{ marginTop: -6, fontSize: "0.85rem" }}>
            Came through a partner or a tribe member? Enter their code so we can credit them.
          </p>

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
