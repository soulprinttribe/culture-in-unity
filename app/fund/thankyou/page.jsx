import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="container center" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 560 }}>
      <h1 style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>Thank You</h1>
      <div className="ribbon mt-2 mb-2" />
      <p className="mt-2" style={{ fontSize: "1.1rem" }}>
        Your gift just became part of the vision.
      </p>
      <p className="mt-2">
        Sound for the circle. Space for the tribe. Doors that stay open
        for anyone who feels the call. That is what you planted today.
      </p>
      <div className="card mt-3">
        <p style={{ margin: 0 }}>
          One more thing - the tribe lives beyond the park.{" "}
          <Link href="/join">Join us</Link> and we will send you where we gather.
        </p>
      </div>
      <p className="mt-3"><Link href="/" className="btn secondary">Back to the portal</Link></p>
    </main>
  );
}
