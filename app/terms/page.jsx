import Link from "next/link";
import { EVENT } from "@/lib/config";

export const metadata = { title: "Terms - CULTURE IN UNITY" };

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 720 }}>
      <p><Link href="/" className="muted">back</Link></p>
      <h1 style={{ fontSize: "2.2rem" }}>Terms</h1>
      <div className="card solid mt-3" style={{ lineHeight: 1.7 }}>
        <p><strong>Tickets.</strong> All sales are final - no cash refunds. Tickets are transferable: use the transfer link in your confirmation email to reassign your ticket to another name and email. Each QR code admits one person, once.</p>
        <p className="mt-2"><strong>Entry.</strong> Valid QR ticket (or will-call ID match) required. Doors open 2 PM, {EVENT.dateLabel}. Security will be present; management may refuse entry or remove attendees for unsafe or disrespectful conduct.</p>
        <p className="mt-2"><strong>Event changes.</strong> The lineup and schedule may shift. If the event is cancelled entirely, ticket holders will be contacted with options.</p>
        <p className="mt-2"><strong>Likeness.</strong> The event is photographed and filmed. By attending you consent to appearing in event media used on SOULPRINT platforms.</p>
        <p className="mt-2"><strong>Liability.</strong> You attend at your own risk. SOULPRINT COLLECTIVE and the venue are not responsible for lost or stolen items.</p>
        <p className="mt-2 muted">Questions: soulprinttribe@gmail.com</p>
      </div>
    </main>
  );
}
