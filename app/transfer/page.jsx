"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function TransferForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newName, newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed.");
      setMsg(data.message);
      setDone(true);
    } catch (err) {
      setMsg(err.message);
    }
    setBusy(false);
  }

  if (!token) {
    return <p className="center mt-3">This transfer link is missing its ticket. Use the link from your confirmation email.</p>;
  }

  return (
    <div className="card mt-3" style={{ textAlign: "left" }}>
      {done ? (
        <p style={{ fontSize: "1.1rem" }}>{msg}</p>
      ) : (
        <form onSubmit={submit}>
          <p>Gift your ticket to someone whose soul needs this. They&apos;ll get their own QR by email - yours stops working.</p>
          <label htmlFor="tname">Recipient&apos;s name</label>
          <input id="tname" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
          <label htmlFor="temail">Recipient&apos;s email</label>
          <input id="temail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="them@example.com" />
          {msg && <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12 }}>{msg}</p>}
          <button className="btn mt-3" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Transferring..." : "Transfer ticket"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function TransferPage() {
  return (
    <main className="container" style={{ paddingTop: 50, paddingBottom: 80, maxWidth: 560 }}>
      <h1 className="center" style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)" }}>Transfer your ticket</h1>
      <div className="ribbon mt-2" />
      <Suspense fallback={<p className="center mt-3">Loading...</p>}>
        <TransferForm />
      </Suspense>
      <p className="center mt-3"><Link href="/" className="muted">back to the portal</Link></p>
    </main>
  );
}
