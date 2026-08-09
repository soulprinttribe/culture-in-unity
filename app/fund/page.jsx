"use client";

// /fund - FUND THE TRIBE. QR destination from the painted sign.
// A gift of any size, straight to the vision. No pressure, no tiers of worth.

import { useState } from "react";
import Link from "next/link";
import { EVENT } from "@/lib/config";

const PRESETS = [5.55, 11.11, 22.22, 44.44];

export default function FundPage() {
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(v) {
    setSelected(v);
    setAmount(String(v));
    setError("");
  }

  function typeAmount(v) {
    setAmount(v);
    setSelected(null);
    setError("");
  }

  async function give(e) {
    e.preventDefault();
    setError("");
    const value = parseFloat(amount);
    if (!value || isNaN(value) || value < 1) {
      return setError("Any amount from $1 up - type a number or tap one above.");
    }
    if (value > 10000) {
      return setError("That is a beautiful number - for gifts over $10,000, reach out to us directly.");
    }
    setBusy(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 560 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(2rem, 8vw, 3.2rem)" }}>Fund The Tribe</h1>
      <p className="center mt-1" style={{ fontSize: "1.05rem" }}>
        Everything we gather is free, and it stays free.<br />
        What you plant here is what grows.
      </p>
      <div className="ribbon mt-2 mb-2" />

      <div className="card" style={{ background: "rgba(245,232,41,0.18)" }}>
        <p style={{ margin: 0 }}>
          Your gift goes directly into the vision - sound for the circle, art supplies,
          space for the tribe to gather, and keeping every experience open to anyone
          who feels the call, no matter what is in their pocket.
        </p>
      </div>

      <form onSubmit={give} className="mt-3">
        <label>Choose an amount</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PRESETS.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => pick(v)}
              className="card"
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "16px 8px",
                fontFamily: "inherit",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "inherit",
                borderColor: selected === v ? "var(--sun-yellow)" : undefined,
                borderWidth: selected === v ? 3 : 2,
                background: selected === v ? "rgba(245,232,41,0.18)" : undefined,
              }}
            >
              ${v.toFixed(2)}
            </button>
          ))}
        </div>

        <label htmlFor="amount" className="mt-2">Or type your own</label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => typeAmount(e.target.value)}
          placeholder="Any amount, from the heart"
        />

        {error && (
          <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn glow mt-3" style={{ width: "100%", fontSize: "1.2rem" }} disabled={busy}>
          {busy ? "Opening secure checkout..." : "Give to the vision"}
        </button>
        <p className="muted center mt-2">
          Secure payment by Stripe. Every dollar goes to {EVENT.host}.<br />
          Thank you for building this with us.
        </p>
      </form>

      <p className="center mt-3 muted">
        Rather give your time, your art, or your sound?{" "}
        <Link href="/join">Join the tribe</Link> - that is worth more than money.
      </p>
    </main>
  );
}
