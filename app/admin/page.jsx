"use client";

// /admin - live sales, revenue, inventory, headcount, exports.
// Submissions review arrives in Phase 2.

import { useEffect, useState } from "react";
import PasscodeGate, { usePasscode } from "@/components/PasscodeGate";

export default function AdminPage() {
  const [passcode, savePasscode] = usePasscode();
  const [stats, setStats] = useState(null);
  const [authFailed, setAuthFailed] = useState(false);

  const headers = { "x-admin-passcode": passcode };

  async function load() {
    const res = await fetch("/api/admin/stats", { headers });
    if (res.status === 401) return setAuthFailed(true);
    setStats(await res.json());
    setAuthFailed(false);
  }

  useEffect(() => {
    if (!passcode) return;
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  async function download(type) {
    const res = await fetch("/api/admin/export?type=" + type, { headers });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = type === "subscribers" ? "subscribers.csv" : "door-list.csv";
    a.click();
  }

  if (!passcode || authFailed) {
    return (
      <main className="container" style={{ paddingBottom: 60 }}>
        <h1 className="center mt-3" style={{ fontSize: "2rem" }}>Admin</h1>
        {authFailed && <p className="center mt-2" style={{ color: "var(--ribbon-red)", fontWeight: 700 }}>Wrong passcode - try again.</p>}
        <PasscodeGate onSubmit={savePasscode} />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 760 }}>
      <h3 style={{ fontSize: "1.5rem" }}>CULTURE IN UNITY - Admin</h3>

      {!stats ? (
        <p className="mt-3">Loading...</p>
      ) : (
        <>
          <div className="mt-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <div className="card center">
              <div className="label" style={{ fontSize: "1.8rem" }}>${(stats.totals.revenue / 100).toLocaleString()}</div>
              <div className="muted">Revenue</div>
            </div>
            <div className="card center">
              <div className="label" style={{ fontSize: "1.8rem" }}>{stats.totals.sold} / {stats.totals.cap}</div>
              <div className="muted">Tickets sold</div>
            </div>
            <div className="card center">
              <div className="label" style={{ fontSize: "1.8rem" }}>{stats.totals.checkedIn}</div>
              <div className="muted">Checked in</div>
            </div>
          </div>

          <div className="card mt-3" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid rgba(255,255,255,0.4)" }}>
                  <th style={{ padding: 8 }}>Tier</th>
                  <th style={{ padding: 8 }}>Price</th>
                  <th style={{ padding: 8 }}>Sold</th>
                  <th style={{ padding: 8 }}>Left</th>
                  <th style={{ padding: 8 }}>In</th>
                  <th style={{ padding: 8 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.byTier.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                    <td style={{ padding: 8 }}><strong>{t.name}</strong></td>
                    <td style={{ padding: 8 }}>{t.priceLabel}</td>
                    <td style={{ padding: 8 }}>{t.sold} / {t.cap}</td>
                    <td style={{ padding: 8 }}>{t.remaining}</td>
                    <td style={{ padding: 8 }}>{t.checkedIn}</td>
                    <td style={{ padding: 8 }}>${(t.revenue / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => download("doorlist")}>Door / will-call list (CSV)</button>
            <button className="btn secondary" onClick={() => download("subscribers")}>Subscribers (CSV)</button>
            <a className="btn secondary" href="/scan">Open door check-in</a>
          </div>
          <p className="muted mt-2">
            Tier prices & caps live in lib/config.js. Submissions review lands here in Phase 2.
          </p>
        </>
      )}
    </main>
  );
}
