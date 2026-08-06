import Link from "next/link";
import { EVENT, ACTIVATIONS, BRING } from "@/lib/config";

export default function Home() {
  return (
    <main>
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "48px 20px",
          backgroundColor: "#2f6fd0",
          backgroundImage: "url('/sitp-park.jpg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      >
        <p className="label" style={{ color: "#fff", letterSpacing: 2, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {EVENT.host} &middot; @soulprinttribe
        </p>

        <img
          src="/sitp-title.png"
          alt={EVENT.name}
          style={{ width: "min(88%, 620px)", height: "auto", margin: "14px 0 6px" }}
        />

        <div
          className="card"
          style={{
            background: "var(--sun-yellow)",
            color: "#1a1a6a",
            display: "inline-block",
            padding: "10px 22px",
            transform: "rotate(-2deg)",
          }}
        >
          <span className="label" style={{ fontSize: "1.35rem" }}>FREE &middot; NO TICKET &middot; JUST COME</span>
        </div>

        <p style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginTop: 18, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
          {EVENT.dateLabel} &middot; {EVENT.timeLabel}<br />
          {EVENT.venueName}<br />
          {EVENT.venueAddress}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 26 }}>
          <Link href="/tickets" className="btn glow" style={{ fontSize: "1.15rem" }}>Let us know you are coming</Link>
          <Link href={EVENT.mapUrl} className="btn secondary">Open the map</Link>
        </div>

        <p style={{ color: "#fff", marginTop: 22, fontStyle: "italic", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
          {EVENT.tagline}
        </p>
      </section>

      <section className="container" style={{ paddingTop: 56, paddingBottom: 40, maxWidth: 760 }}>
        <h2 className="center">The day</h2>
        <div className="ribbon mt-2 mb-3" />
        <div style={{ display: "grid", gap: 12 }}>
          {ACTIVATIONS.map((a) => (
            <div key={a.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span className="label" style={{ fontSize: "1.1rem" }}>{a.name}</span>
                <span className="label" style={{ whiteSpace: "nowrap" }}>{a.time}</span>
              </div>
              <p className="muted mt-1">{a.desc}</p>
            </div>
          ))}
        </div>
        <p className="center muted mt-3">Come for an hour or stay for all five. However you show up is right.</p>
      </section>

      <section className="container" style={{ paddingBottom: 40, maxWidth: 760 }}>
        <div className="card center" style={{ background: "rgba(245,232,41,0.18)" }}>
          <h3>Bring</h3>
          <p className="mt-1" style={{ fontSize: "1.1rem" }}>{BRING.join(" · ")}</p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 56, maxWidth: 760 }}>
        <h2 className="center">Want to share something?</h2>
        <div className="ribbon mt-2 mb-3" />
        <div style={{ display: "grid", gap: 12 }}>
          <Link href="/submit/artist" className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <span className="label" style={{ fontSize: "1.1rem" }}>Show your art &rarr;</span>
            <p className="muted mt-1">Bring your work and show it in the open air. Free.</p>
          </Link>
          <Link href="/submit/perform" className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <span className="label" style={{ fontSize: "1.1rem" }}>Perform your music &rarr;</span>
            <p className="muted mt-1">Share your sound on the grass. Free.</p>
          </Link>
          <Link href="/submit/vendor" className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <span className="label" style={{ fontSize: "1.1rem" }}>Become a vendor &rarr;</span>
            <p className="muted mt-1">A small circle of conscious makers.</p>
          </Link>
        </div>
      </section>

      <footer className="container center" style={{ paddingBottom: 60, maxWidth: 760 }}>
        <div className="ribbon mb-3" />
        <p className="label" style={{ fontSize: "1.1rem" }}>{EVENT.tagline2}</p>
        <p className="muted mt-2">Peace and blessings.</p>
        <p className="mt-3">
          <Link href="/info">Event info</Link> &middot; <Link href="/terms">Terms</Link> &middot; <Link href="/privacy">Privacy</Link>
        </p>
        <p className="muted mt-2">{EVENT.host} &middot; @soulprinttribe</p>
      </footer>
    </main>
  );
}
