import Link from "next/link";
import FlagBreak from "@/components/FlagBreak";
import { EVENT } from "@/lib/config";

export const metadata = { title: "You're in - CULTURE IN UNITY" };

export default function SuccessPage() {
  return (
    <main
      className="center"
      style={{
        minHeight: "100svh",
        padding: "70px 20px 80px",
        backgroundImage: "url('/sky.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div className="container" style={{ maxWidth: 620 }}>
        <h1 style={{ fontSize: "clamp(2rem, 7vw, 3rem)" }}>You&apos;re in.</h1>
        <FlagBreak />
        <div className="card mt-3" style={{ textAlign: "left", background: "rgba(30,45,140,0.45)" }}>
          <p style={{ fontSize: "1.15rem" }}>Peace and blessings - your place inside the portal is confirmed.</p>
          <p className="mt-2">
            <strong>Check your email.</strong> Your QR ticket is on its way (check spam/promotions
            if it hasn&apos;t landed in a few minutes). Show the QR at the door.
          </p>
          <p className="mt-2">
            <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
            {EVENT.venueName} · {EVENT.venueAddress}
          </p>
          <p className="mt-2 muted">
            Plans change? Your ticket is transferable - the link is in your email. No refunds.
          </p>
        </div>
        <p className="mt-3">
          <Link href="/info" className="btn secondary">What to expect</Link>
        </p>
        <p className="mt-2">
          <Link href="/" className="muted">step back through the portal</Link>
        </p>
      </div>
    </main>
  );
}
