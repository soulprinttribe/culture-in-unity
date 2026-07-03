import Link from "next/link";

export const metadata = { title: "Privacy - CULTURE IN UNITY" };

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 720 }}>
      <p><Link href="/" className="muted">back</Link></p>
      <h1 style={{ fontSize: "2.2rem" }}>Privacy</h1>
      <div className="card solid mt-3" style={{ lineHeight: 1.7 }}>
        <p><strong>What we collect.</strong> When you buy a ticket or apply to participate we collect your name and email (and payment details, handled entirely by Stripe - we never see your card number).</p>
        <p className="mt-2"><strong>How we use it.</strong> To deliver your ticket, run door check-in, and keep you updated about this and future SOULPRINT events. You can unsubscribe from updates anytime via the link in any email.</p>
        <p className="mt-2"><strong>Who we share with.</strong> Service providers only: Stripe (payments), our email provider (ticket delivery), and Brevo (community updates). We never sell your data.</p>
        <p className="mt-2"><strong>Your choices.</strong> Email soulprinttribe@gmail.com to ask what we hold about you or to have it deleted.</p>
      </div>
    </main>
  );
}
