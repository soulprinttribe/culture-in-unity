import Link from "next/link";
import { EVENT, ACTIVATIONS } from "@/lib/config";

export const metadata = { title: "Event Info - CULTURE IN UNITY" };

const FAQ = [
  ["What is CULTURE IN UNITY?", "A 6-hour cultural celebration bringing many cultures together to showcase and appreciate our differences, while remembering we are all one - unity within the difference."],
  ["When and where?", EVENT.dateLabel + ", " + EVENT.timeLabel + ". " + EVENT.venueName + ", " + EVENT.venueAddress + ". Doors open at 2 PM."],
  ["Can I buy tickets at the door?", "Yes - walk-up sales happen at the door (card via tap-to-pay, or scan the QR sign to buy on your phone). Buying ahead guarantees your spot and saves you money on Early Bird."],
  ["Is food included?", "The GA + Food tier includes a cultural food plate. All other tiers can purchase plates from the food vendors inside."],
  ["What should I bring?", "Your ID, an open heart, comfortable shoes to dance in, and cash/card for the marketplace and food. Please leave outside food & drink and anything unsafe at home - security will be present so everyone can feel safe and free."],
  ["How do I get there?", "L train to Jefferson St - the venue is a short walk from the station. B57/B38 buses stop nearby. Street parking is limited; transit is the easeful path."],
  ["Are tickets refundable?", "No refunds - but tickets are fully transferable. Use the transfer link in your confirmation email to gift your ticket to someone else."],
  ["I'm an artist / performer / designer / vendor - can I participate?", "Yes - applications open soon for the Art Showcase, Live Performances, Fashion Show, and Marketplace. Follow SOULPRINT to hear first."],
];

export default function InfoPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 100, maxWidth: 760 }}>
      <p><Link href="/" className="muted">back to the portal</Link></p>
      <h1 style={{ fontSize: "clamp(2rem, 7vw, 3rem)" }}>The Experience</h1>
      <p className="mt-2" style={{ fontSize: "1.15rem" }}>
        <strong>{EVENT.name}</strong> is the {EVENT.frame} - a 6-hour celebration of many
        cultures under one roof, one rhythm, one soul. Hosted by {EVENT.host}.
      </p>
      <p className="mt-2">
        <strong>{EVENT.dateLabel} · {EVENT.timeLabel}</strong><br />
        {EVENT.venueName} · {EVENT.venueAddress}
      </p>
      <div className="ribbon mt-3 mb-2" />

      <h2 style={{ fontSize: "1.7rem" }}>The activations</h2>
      <div className="mt-2" style={{ display: "grid", gap: 12 }}>
        {ACTIVATIONS.map((a) => (
          <div key={a.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ fontSize: "1.1rem" }}>{a.name}</h3>
              <span className="muted">{a.time}</span>
            </div>
            <p className="mt-1">{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="ribbon mt-4 mb-2" />
      <h2 style={{ fontSize: "1.7rem" }}>Good to know</h2>
      <div className="mt-2" style={{ display: "grid", gap: 12 }}>
        {FAQ.map(([q, a]) => (
          <details key={q} className="card">
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "1.05rem" }}>{q}</summary>
            <p className="mt-2">{a}</p>
          </details>
        ))}
      </div>

      <div className="center mt-4">
        <Link href="/tickets" className="btn glow" style={{ fontSize: "1.15rem" }}>Get Tickets</Link>
      </div>
    </main>
  );
}
