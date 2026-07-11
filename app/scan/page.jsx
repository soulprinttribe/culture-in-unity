"use client";

// /scan - door check-in: QR scan + will-call search + live headcount.
// Handles both attendee tickets and artist/vendor role passes.
// Staff-only (passcode). Works on any phone with a camera.

import { useEffect, useRef, useState } from "react";
import PasscodeGate, { usePasscode } from "@/components/PasscodeGate";

export default function ScanPage() {
  const [passcode, savePasscode] = usePasscode();
  const [result, setResult] = useState(null);
  const [headcount, setHeadcount] = useState(null);
  const [cap, setCap] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const headers = { "Content-Type": "application/json", "x-admin-passcode": passcode };

  async function refreshCount() {
    const res = await fetch("/api/checkin", { headers });
    if (res.status === 401) return setAuthFailed(true);
    const d = await res.json();
    setHeadcount(d.headcount);
    setCap(d.cap);
    setAuthFailed(false);
  }

  useEffect(() => {
    if (passcode) refreshCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  async function checkinToken(token) {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers,
        body: JSON.stringify({ token }),
      });
      const d = await res.json();
      setResult(d);
      if (d.headcount !== undefined) { setHeadcount(d.headcount); setCap(d.cap); }
      if (navigator.vibrate) navigator.vibrate(d.ok ? 80 : [80, 60, 80]);
    } finally {
      setTimeout(() => { busyRef.current = false; }, 1500);
    }
  }

  async function startScanner() {
    setScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    await scanner.start(
      { facingMode: "environment" },
      { fps: 8, qrbox: { width: 240, height: 240 } },
      (decoded) => checkinToken(decoded),
      () => {}
    );
  }

  function stopScanner() {
    setScanning(false);
    if (scannerRef.current) scannerRef.current.stop().catch(() => {});
  }

  async function search(e) {
    e.preventDefault();
    const res = await fetch("/api/checkin?q=" + encodeURIComponent(query), { headers });
    const d = await res.json();
    setSearchResults(d.results || []);
  }

  async function manualCheckin(ticketId) {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers,
      body: JSON.stringify({ manual: true, ticketId }),
    });
    const d = await res.json();
    setResult(d);
    if (d.headcount !== undefined) { setHeadcount(d.headcount); setCap(d.cap); }
    setSearchResults([]);
    setQuery("");
  }

  if (!passcode || authFailed) {
    return (
      <main className="container" style={{ paddingBottom: 60 }}>
        <h1 className="center mt-3" style={{ fontSize: "2rem" }}>Door Check-in</h1>
        {authFailed && <p className="center mt-2" style={{ color: "var(--ribbon-red)", fontWeight: 700 }}>Wrong passcode - try again.</p>}
        <PasscodeGate onSubmit={savePasscode} />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 20, paddingBottom: 60, maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.4rem" }}>Door Check-in</h3>
        <div className="card" style={{ padding: "8px 16px" }}>
          <strong style={{ fontSize: "1.3rem" }}>{headcount == null ? "-" : headcount}</strong>
          <span className="muted"> / {cap == null ? "-" : cap} in</span>
        </div>
      </div>

      {result && (
        <div
          className="mt-2"
          style={{
            padding: "18px",
            borderRadius: 16,
            fontWeight: 700,
            fontSize: "1.15rem",
            background: result.ok ? "var(--ribbon-green)" : "var(--ribbon-red)",
            color: "#fff",
          }}
        >
          <div>{result.message}</div>
          {result.ticket && (
            <div className="mt-1" style={{ fontWeight: 400 }}>
              {result.ticket.name}
              {result.ticket.role ? (
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 8,
                    padding: "2px 12px",
                    borderRadius: 999,
                    background: result.ticket.roleColor || "#4b2fd0",
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                  }}
                >
                  {result.ticket.tier}
                </span>
              ) : (
                <span> &middot; {result.ticket.tier}</span>
              )}
              {result.ticket.wristband && (
                <div className="mt-1" style={{ fontWeight: 700 }}>
                  Wristband: {result.ticket.wristband}
                  {result.ticket.includesFood ? " · includes FOOD" : ""}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div id="qr-reader" className="mt-2" style={{ borderRadius: 16, overflow: "hidden" }} />
      {!scanning ? (
        <button className="btn mt-2" style={{ width: "100%" }} onClick={startScanner}>Start scanning</button>
      ) : (
        <button className="btn secondary mt-2" style={{ width: "100%" }} onClick={stopScanner}>Stop camera</button>
      )}

      <form onSubmit={search} className="mt-3">
        <label htmlFor="q">Will-call search (name or email)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
          <button className="btn" type="submit">Go</button>
        </div>
      </form>
      {searchResults.map((t) => (
        <div key={t.id} className="card mt-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>{t.holder_name}</strong> <span className="muted">{t.holder_email}</span>
            <div className="muted">{t.tierName} · {t.status}{t.wristband_color ? " · " + t.wristband_color : ""}</div>
          </div>
          {t.status === "valid" && (
            <button className="btn" style={{ padding: "8px 16px" }} onClick={() => manualCheckin(t.id)}>
              Check in
            </button>
          )}
        </div>
      ))}
      <p className="muted center mt-3">Artist &amp; vendor passes scan here too - their role shows in its own color.</p>
    </main>
  );
}
