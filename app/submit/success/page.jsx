import Link from "next/link";
import { ROLES, EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function SubmitSuccess({ searchParams }) {
  const role = (searchParams && searchParams.role) || "";
  const r = ROLES[role] || { label: "Participant", fee: 0 };
  const isFree = r.fee === 0;
  const isPerformer = role === "perform";

  return (
    <main className="container center" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 560 }}>
      <h1 style={{ fontSize: "clamp(2rem, 7vw, 3rem)" }}>You&apos;re In</h1>
      <div className="ribbon mt-2 mb-2" />
      <p className="mt-2">
        {isFree ? "Your " : "Payment received - your "}
        <strong>{r.label}</strong> spot at {EVENT.name} is confirmed.
      </p>
      <p className="mt-2">Check your email for your role pass and QR code. Keep it - you&apos;ll scan it at the door.</p>

      <div className="card mt-3" style={{ textAlign: "left" }}>
        <h3>Remember</h3>
        {isPerformer ? (
          <>
            <p className="mt-1">Please arrive by <strong>2:00 PM</strong> for sound and running order.</p>
            <p className="mt-1">Bring your track files with you - a member of the team will collect them at the welcome table.</p>
          </>
        ) : (
          <p className="mt-1">
            Build-in starts at <strong>1:00 PM</strong>. Be fully set up by <strong>2:00 PM</strong> - late arrivals may forfeit their spot so we can open the doors on time.
          </p>
        )}
      </div>

      <p className="mt-3"><Link href="/" className="btn secondary">Back to the portal</Link></p>
    </main>
  );
}
