"use client";

// / - the portal. Phase 1: portal hero + one alive immersive moment.
// "Skip -> Get Tickets" is always one tap away. Full scroll-journey = Phase 2.

import Link from "next/link";
import Globe from "@/components/Globe";
import { EVENT, ACTIVATIONS } from "@/lib/config";

const CLOUDS = [
  { top: "8%", w: 180, h: 46, dur: "70s", delay: "0s" },
  { top: "18%", w: 120, h: 34, dur: "95s", delay: "-30s" },
  { top: "30%", w: 220, h: 54, dur: "80s", delay: "-55s" },
  { top: "6%", w: 90, h: 26, dur: "110s", delay: "-70s" },
];

export default function Home() {
  return (
    <main style={{ overflow: "hidden", position: "relative" }}>
      {/* Persistent skip-to-tickets - never block a sale */}
      <div className="get-tickets-fab">
        <Link href="/tickets" className="btn glow">Get Tickets</Link>
      </div>

      {/* PORTAL HERO */}
      <section
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          padding: "60px 20px 80px",
        }}
      >
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="cloud"
            style={{ top: c.top, width: c.w, height: c.h, animationDuration: c.dur, animationDelay: c.delay }}
          />
        ))}

        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
          }}
        />

        <img
          src="/soulprint-logo.svg"
          alt="SOULPRINT"
          style={{ height: 84, marginBottom: 6, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
        />
        <p className="label" style={{ fontSize: "0.95rem", letterSpacing: "0.2em", color: "var(--cyan)" }}>
          {EVENT.frame}
        </p>

        <div
          style={{
            margin: "28px 0",
            padding: 26,
            borderRadius: "50%",
            border: "6px solid var(--sun-yellow)",
            boxShadow: "0 0 40px rgba(245,232,41,0.55), inset 0 0 40px rgba(245,232,41,0.25)",
          }}
        >
          <Globe size={230} />
        </div>

        <h1 style={{ fontSize: "clamp(2.4rem, 9vw, 4.6rem)", maxWidth: 800 }}>
          CULTURE IN UNITY
        </h1>
        <p className="mt-2" style={{ fontSize: "1.25rem", fontStyle: "italic" }}>
          {EVENT.tagline} · {EVENT.tagline2}
        </p>
        <p className="mt-2" style={{ fontSize: "1.1rem" }}>
          <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
          {EVENT.venueName} · {EVENT.venueAddress}
        </p>

        <div className="mt-3" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/tickets" className="btn" style={{ fontSize: "1.15rem" }}>Step through - Get Tickets</Link>
          <a href="#journey" className="btn secondary">Enter the world</a>
        </div>
      </section>

      {/* THE JOURNEY (Phase 1 preview; full scroll-scenes = Phase 2) */}
      <section id="journey" className="container" style={{ paddingBottom: 40 }}>
        <div className="ribbon mb-2" />
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
        <div className="ribbon mb-2" />
        <p className="label">Peace and blessings.</p>
        <p className="muted mt-1">
          Hosted by {EVENT.host} · <Link href="/info">Event info</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
