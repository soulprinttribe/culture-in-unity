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
          style={{ height: 130, marginBottom: 10, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
        />
        <p className="label" style={{ fontSize: "0.95rem", letterSpacing: "0.2em", color: "var(--cyan)" }}>
          {EVENT.frame}
        </p>
