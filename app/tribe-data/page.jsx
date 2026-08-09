"use client";

// /tribe-data - who joined, who funded, who RSVP'd. Passcode gated.

import { useEffect, useState } from "react";

const BLUE = "#19189A";
const GOLD = "#E5E630";
const DEEP = "#100f6e";
const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

function money(cents) {
  return "$" + ((cents || 0) / 100).toFixed(2);
}

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function toCsv(rows, cols) {
  const head = cols.join(",");
  const body = rows.map(function (r) {
    return cols.map(function (c) {
      const v = r[c] == null ? "" : String(r[c]);
      return '"' + v.replace(/"/g, '""') + '"';
    }).join(",");
  }).join("\n");
  return head + "\n" + body;
}

function download(name, text) {
  const blob = new Blob([text], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

export default function TribeDataPage() {
  const [passcode, setPasscode] = useState("");
  const [entered, setEntered] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("tribe");

  useEffect(function () {
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem("sp_pass") : "";
    if (saved) setPasscode(saved);
  }, []);

  useEffect(function () {
    if (!passcode) return;
    setErr("");
    fetch("/api/admin/tribe", { headers: { "x-admin-passcode": passcode } })
      .then(function (r) {
        if (r.status === 401) throw new Error("Wrong passcode");
        return r.json();
      })
      .then(setData)
      .catch(function (e) {
        setErr(e.message);
        setPasscode("");
        if (typeof window !== "undefined") window.sessionStorage.removeItem("sp_pass");
      });
  }, [passcode]);

  const wrap = {
    minHeight: "100vh",
    background: BLUE,
    padding: "40px 18px 80px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#fff",
  };

  if (!passcode) {
    return (
      <main style={wrap}>
        <div style={{ maxWidth: 380, margin: "60px auto 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: IMPACT, color: GOLD, fontSize: "2.6rem", textTransform: "uppercase", margin: 0 }}>Tribe Data</h1>
          <p style={{ color: "#b9b8f5", marginTop: 10 }}>Enter the passcode.</p>
          <form
            onSubmit={function (e) {
              e.preventDefault();
              if (typeof window !== "undefined") window.sessionStorage.setItem("sp_pass", entered);
              setPasscode(entered);
            }}
          >
            <input
              type="password"
              value={entered}
              onChange={function (e) { setEntered(e.target.value); }}
              placeholder="Passcode"
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", fontSize: "1.05rem", borderRadius: 12, border: "3px solid " + GOLD, background: DEEP, color: "#fff", outline: "none", marginTop: 16 }}
            />
            {err && <p style={{ background: "#e0403f", padding: "10px 14px", borderRadius: 10, marginTop: 14, fontWeight: 700 }}>{err}</p>}
            <button type="submit" style={{ width: "100%", marginTop: 16, padding: 14, background: GOLD, color: BLUE, border: "none", borderRadius: 12, fontFamily: IMPACT, fontSize: "1.25rem", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Unlock</button>
          </form>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main style={wrap}><p style={{ textAlign: "center", marginTop: 60 }}>Loading...</p></main>;
  }

  const t = data.totals || {};
  const stat = { background: DEEP, border: "3px solid " + GOLD, borderRadius: 16, padding: "18px 14px", textAlign: "center" };
  const statNum = { fontFamily: IMPACT, color: GOLD, fontSize: "2.1rem", lineHeight: 1 };
  const statLbl = { color: "#b9b8f5", fontSize: "0.8rem", letterSpacing: 1, textTransform: "uppercase", marginTop: 6 };
  const th = { textAlign: "left", padding: "10px 12px", color: GOLD, fontFamily: IMPACT, letterSpacing: 1, fontSize: "0.85rem", textTransform: "uppercase", borderBottom: "2px solid " + GOLD };
  const td = { padding: "10px 12px", borderBottom: "1px solid #2a29b5", fontSize: "0.92rem", verticalAlign: "top" };
  const tabBtn = function (id, label) {
    return (
      <button
        key={id}
        onClick={function () { setTab(id); }}
        style={{ padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontFamily: IMPACT, letterSpacing: 1, fontSize: "1rem", textTransform: "uppercase", border: "3px solid " + GOLD, background: tab === id ? GOLD : "transparent", color: tab === id ? BLUE : GOLD }}
      >
        {label}
      </button>
    );
  };

  return (
    <main style={wrap}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontFamily: IMPACT, color: GOLD, fontSize: "clamp(2.2rem,7vw,3.2rem)", textTransform: "uppercase", margin: 0, textAlign: "center" }}>Tribe Data</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 24 }}>
          <div style={stat}><div style={statNum}>{t.tribeCount || 0}</div><div style={statLbl}>Tribe members</div></div>
          <div style={stat}><div style={statNum}>{money(t.raised)}</div><div style={statLbl}>Raised</div></div>
          <div style={stat}><div style={statNum}>{t.donationCount || 0}</div><div style={statLbl}>Gifts</div></div>
          <div style={stat}><div style={statNum}>{t.rsvpCount || 0}</div><div style={statLbl}>RSVPs</div></div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26, justifyContent: "center" }}>
          {tabBtn("tribe", "Tribe")}
          {tabBtn("donations", "Funders")}
          {tabBtn("rsvps", "RSVPs")}
        </div>

        <div style={{ textAlign: "right", marginTop: 18 }}>
          <button
            onClick={function () {
              if (tab === "tribe") download("tribe.csv", toCsv(data.tribe, ["name", "email", "source", "created_at"]));
              else if (tab === "donations") download("funders.csv", toCsv(data.donations, ["name", "email", "amount", "note", "created_at"]));
              else download("rsvps.csv", toCsv(data.rsvps, ["name", "email", "bringing", "source", "created_at"]));
            }}
            style={{ padding: "8px 16px", borderRadius: 10, cursor: "pointer", background: "transparent", color: GOLD, border: "2px solid " + GOLD, fontSize: "0.85rem", letterSpacing: 1, textTransform: "uppercase" }}
          >
            Download CSV
          </button>
        </div>

        <div style={{ background: DEEP, border: "3px solid " + GOLD, borderRadius: 16, marginTop: 12, overflowX: "auto" }}>
          {tab === "tribe" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Source</th><th style={th}>Joined</th></tr></thead>
              <tbody>
                {data.tribe.length === 0 && <tr><td style={td} colSpan={4}>Nobody yet. The sign will change that.</td></tr>}
                {data.tribe.map(function (r, i) {
                  return <tr key={i}><td style={td}>{r.name}</td><td style={td}>{r.email}</td><td style={td}>{r.source}</td><td style={td}>{when(r.created_at)}</td></tr>;
                })}
              </tbody>
            </table>
          )}

          {tab === "donations" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Amount</th><th style={th}>Note</th><th style={th}>When</th></tr></thead>
              <tbody>
                {data.donations.length === 0 && <tr><td style={td} colSpan={5}>No gifts yet.</td></tr>}
                {data.donations.map(function (r, i) {
                  return <tr key={i}><td style={td}>{r.name}</td><td style={td}>{r.email}</td><td style={{ padding: "10px 12px", borderBottom: "1px solid #2a29b5", fontWeight: 700, color: GOLD }}>{money(r.amount)}</td><td style={td}>{r.note}</td><td style={td}>{when(r.created_at)}</td></tr>;
                })}
              </tbody>
            </table>
          )}

          {tab === "rsvps" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Bringing</th><th style={th}>Source</th><th style={th}>When</th></tr></thead>
              <tbody>
                {data.rsvps.length === 0 && <tr><td style={td} colSpan={5}>No RSVPs yet.</td></tr>}
                {data.rsvps.map(function (r, i) {
                  return <tr key={i}><td style={td}>{r.name}</td><td style={td}>{r.email}</td><td style={td}>{r.bringing}</td><td style={td}>{r.source}</td><td style={td}>{when(r.created_at)}</td></tr>;
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ color: "#b9b8f5", textAlign: "center", marginTop: 22, fontSize: "0.85rem" }}>
          Refresh the page for the latest.
        </p>
      </div>
    </main>
  );
}
