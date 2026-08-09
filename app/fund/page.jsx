"use client";

// /fund - FUND THE TRIBE. True SOULPRINT brand: royal blue + gold, Impact.
// Self-contained styling - independent of the event site's look.

import { useState } from "react";

const BLUE = "#19189A";
const GOLD = "#E5E630";
const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

const PRESETS = [5.55, 11.11, 22.22, 44.44];

export default function FundPage() {
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
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
        body: JSON.stringify({ amount: value, note: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
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
  const label = {
    display: "block",
    marginTop: 20,
    color: GOLD,
    fontFamily: IMPACT,
    letterSpacing: 2,
    fontSize: "0.95rem",
    textTransform: "uppercase",
  };
  const field = {
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
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  return (
    <main style={wrap}>
      <img src="/SOULPRINT%20LOGO_YELLOW_V2.png" alt="SOULPRINT" style={{ width: 120, height: "auto", marginTop: 10 }} />
      <h1 style={h1}>Fund<br />The Tribe</h1>
      <p style={{ color: "#fff", fontSize: "1.1rem", textAlign: "center", maxWidth: 420, margin: 0 }}>
        Everything we gather is free, and it stays free.
      </p>
      <p style={{ color: "#b9b8f5", textAlign: "center", maxWidth: 420, lineHeight: 1.55, margin: "10px 0 0" }}>
        Your gift goes directly into the vision - sound for the circle, art
        supplies, space for the tribe to gather, and keeping every experience
        open to anyone who feels the call, no matter what is in their pocket.
      </p>

      <form onSubmit={give} style={{ width: "100%", maxWidth: 440, marginTop: 8 }}>
        <label style={label}>Choose an amount</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          {PRESETS.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => pick(v)}
              style={{
                padding: "18px 8px",
                borderRadius: 14,
                cursor: "pointer",
                fontFamily: IMPACT,
                fontSize: "1.35rem",
                letterSpacing: 1,
                background: selected === v ? GOLD : "#100f6e",
                color: selected === v ? BLUE : GOLD,
                border: "3px solid " + GOLD,
              }}
            >
              ${v.toFixed(2)}
            </button>
          ))}
        </div>

        <label style={label} htmlFor="amount">Or type your own</label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => typeAmount(e.target.value)}
          placeholder="Any amount, from the heart"
          style={field}
        />

        <label style={label} htmlFor="note">Leave a note (optional)</label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A word for the tribe, or where you wish this to go..."
          style={field}
        />

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
          {busy ? "Opening secure checkout..." : "Give To The Vision"}
        </button>
        <p style={{ color: "#b9b8f5", textAlign: "center", marginTop: 14, fontSize: "0.9rem" }}>
          Secure payment by Stripe. Every dollar goes to SOULPRINT COLLECTIVE.
        </p>
      </form>

      <p style={{ color: "#b9b8f5", marginTop: 26, fontSize: "0.95rem", textAlign: "center" }}>
        Rather give your time, your art, or your sound?{" "}
        <a href="/join" style={{ color: GOLD, fontWeight: 700 }}>Join the tribe</a>
        <br />That is worth more than money.
      </p>
    </main>
  );
}
