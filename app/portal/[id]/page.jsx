import Link from "next/link";
import { notFound } from "next/navigation";
import { ACTIVATIONS, EVENT } from "@/lib/config";
import FlagBreak from "@/components/FlagBreak";

const IMPACT = "var(--font-label), Impact, 'Arial Narrow Bold', sans-serif";

const PEOPLE_LABEL = {
  meditation: "The guides",
  film: "The creators",
  panel: "The voices",
  food: "The kitchen",
  performances: "The performers",
  dance: "The choreographers",
  fashion: "The designers",
  art: "The artists",
  market: "The makers",
};

export function generateStaticParams() {
  return ACTIVATIONS.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }) {
  const a = ACTIVATIONS.find((x) => x.id === params.id);
  return { title: (a ? a.name : "Portal") + " - " + EVENT.name };
}

export default function PortalPage({ params }) {
  const a = ACTIVATIONS.find((x) => x.id === params.id);
  if (!a) return notFound();
  const peopleLabel = PEOPLE_LABEL[a.id] || "The team";

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 720 }}>
      <p className="center"><Link href="/#journey" className="muted">back to the journey</Link></p>
      <p className="label center" style={{ color: "var(--cyan)", letterSpacing: "0.12em" }}>{a.time}</p>
      <h1 className="center" style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)", fontFamily: IMPACT }}>{a.name}</h1>

      <FlagBreak canvasStyle={{ height: 120 }} />

      <div className="card solid">
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, margin: 0 }}>{a.long || a.desc}</p>
      </div>

      {a.menu && a.menu.length > 0 && (
        <>
          <h3 className="mt-4">On the menu</h3>
          <div className="card mt-2">
            <ul style={{ paddingLeft: 18, lineHeight: 1.9, margin: 0 }}>
              {a.menu.map((m) => <li key={m}>{m}</li>)}
            </ul>
            {a.drinks && a.drinks.length > 0 && (
              <p className="mt-2" style={{ marginBottom: 0 }}><strong>To drink:</strong> {a.drinks.join(" · ")}</p>
            )}
          </div>
        </>
      )}

      <h3 className="mt-4">{peopleLabel}</h3>
      {a.people && a.people.length > 0 ? (
        <div className="mt-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {a.people.map((p, i) => (
            <div key={i} className="card center">
              {p.photo ? <img src={p.photo} alt={p.name} style={{ width: "100%", borderRadius: 12, marginBottom: 8, display: "block" }} /> : null}
              <div className="label" style={{ fontSize: "1rem" }}>{p.name}</div>
              {p.role ? <div className="muted">{p.role}</div> : null}
              {p.handle ? <div className="muted">{p.handle}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-2 center">
          <p className="muted" style={{ margin: 0 }}>The souls bringing this to life are being confirmed. Check back soon - this page will fill with their faces, stories, and details.</p>
        </div>
      )}

      <div className="center mt-4">
        <Link href="/tickets" className="btn glow" style={{ fontSize: "1.1rem" }}>Get Tickets</Link>
      </div>
    </main>
  );
}
