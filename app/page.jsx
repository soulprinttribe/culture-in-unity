"use client";

// / - the portal, rebuilt from the actual flyer art:
// real sky, real bubble-lettering title, the globe-head being with body.

import Link from "next/link";
import TitleArt from "@/components/TitleArt";
import Cutout from "@/components/Cutout";
import FlagBreak from "@/components/FlagBreak";
import { EVENT, ACTIVATIONS } from "@/lib/config";

export default function Home() {
  return (
    <main style={{ overflow: "hidden", position: "relative" }}>
      {/* Persistent skip-to-tickets - never block a sale */}
      <div className="get-tickets-fab">
        <Link href="/tickets" className="btn glow">Get Tickets</Link>
      </div>

      {/* PORTAL HERO - flyer sky + flyer title + the being */}
      <section
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          position: "relative",
          padding: "48px 20px 0",
          backgroundImage: "url('/sky.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <img
          src="/soulprint-logo.svg"
          alt="SOULPRINT"
          style={{ height: 300, marginBottom: 10, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
        />
        <p className="label" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", letterSpacing: "0.18em", color: "var(--cyan)", textShadow: "2px 2px 0 var(--indigo), 0 0 18px rgba(75,47,208,0.6)" }}>
          {EVENT.frame}
        </p>

        {/* The exact flyer title, white keyed out + cropped at runtime */}
        <div className="mt-2" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <TitleArt
            src="/CULTURE%20IN%20UNITY%20V3_2.png.jpg"
            alt="CULTURE IN UNITY"
            maxWidth={560}
          />
        </div>

        <p className="label mt-2" style={{ fontSize: "clamp(1.05rem, 2.6vw, 1.5rem)", color: "#fff", textShadow: "0 0 16px rgba(75,47,208,0.95), 0 0 34px rgba(75,47,208,0.7), 0 2px 4px rgba(26,26,80,0.8)" }}>
          {EVENT.tagline} ÃÂ· {EVENT.tagline2}
        </p>
        <p className="label mt-1" style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)", color: "#fff", textShadow: "0 0 16px rgba(75,47,208,0.95), 0 0 34px rgba(75,47,208,0.7), 0 2px 4px rgba(26,26,80,0.8)" }}>
          <strong>{EVENT.dateLabel} ÃÂ· {EVENT.timeLabel}</strong><br />
          {EVENT.venueName} ÃÂ· {EVENT.venueAddress}
        </p>

        <div className="mt-3" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", zIndex: 2 }}>
          <Link href="/tickets" className="btn" style={{ fontSize: "1.1rem" }}>Step through - Get Tickets</Link>
          <a href="#journey" className="btn secondary">Enter the world</a>
        </div>

        {/* The globe-head being, body and all - white background flood-filled away */}
        <Cutout
          src="/CULTURE%20IN%20UNITY%20V3_1.png"
          alt="The globe-head being holding planet Earth as its head"
          style={{ width: "min(88vw, 620px)", marginTop: -40, display: "block", pointerEvents: "none" }}
        />
      </section>

      {/* THE JOURNEY (Phase 1 preview; full scroll-scenes = Phase 2) */}
      <section id="journey" className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <FlagBreak />
        <h2 className="center" style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)" }}>
          One day. Nine portals.
        </h2>
        <p className="center mt-1 muted" style={{ maxWidth: 620, margin: "8px auto 0" }}>
          SOULPRINT has always built portals - this is the next one you step through.
          Scroll the day. Times will settle as the run-of-show is finalized.
        </p>

        <div className="mt-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {ACTIVATIONS.map((a) => (
            <div key={a.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.15rem" }}>{a.name}</h3>
                <span className="muted">{a.time}</span>
              </div>
              <p className="mt-1">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="center mt-4">
          <p style={{ fontSize: "1.15rem", fontStyle: "italic" }}>
            Don&apos;t just read about the portal. Walk through it.
          </p>
          <Link href="/tickets" className="btn glow mt-2" style={{ fontSize: "1.15rem" }}>
            Get Tickets
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container center" style={{ padding: "50px 20px 110px" }}>
        <FlagBreak />
        <p className="label">Peace and blessings.</p>
        <p className="muted mt-1">
          Hosted by {EVENT.host} ÃÂ· <Link href="/info">Event info</Link> ÃÂ· <Link href="/terms">Terms</Link> ÃÂ· <Link href="/privacy">Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
