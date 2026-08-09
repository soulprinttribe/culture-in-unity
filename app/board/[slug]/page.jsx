import Link from "next/link";
import { notFound } from "next/navigation";
import { CREATORS, getCreator, videoEmbed } from "@/lib/board";

const BLUE = "#19189A";
const GOLD = "#E5E630";
const DEEP = "#100f6e";
const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

export function generateStaticParams() {
  return CREATORS.map(function (c) { return { slug: c.slug }; });
}

export function generateMetadata({ params }) {
  const c = getCreator(params.slug);
  if (!c) return { title: "Tribe Appreciation Board" };
  return { title: c.name + " - Tribe Appreciation Board" };
}

export default function CreatorPage({ params }) {
  const c = getCreator(params.slug);
  if (!c) notFound();

  const wrap = {
    minHeight: "100vh",
    background: BLUE,
    padding: "40px 20px 80px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#fff",
  };
  const inner = { maxWidth: 560, margin: "0 auto", textAlign: "center" };

  return (
    <main style={wrap}>
      <div style={inner}>
        <p style={{ color: GOLD, fontFamily: IMPACT, letterSpacing: 3, fontSize: "0.85rem", textTransform: "uppercase", margin: 0 }}>
          Tribe Appreciation Board
        </p>

        <h1 style={{ fontFamily: IMPACT, color: GOLD, fontSize: "clamp(2.6rem, 12vw, 4rem)", lineHeight: 0.95, textTransform: "uppercase", margin: "10px 0 4px" }}>
          {c.name}
        </h1>

        {c.craft ? (
          <p style={{ color: "#b9b8f5", margin: "0 0 6px", fontSize: "1.05rem" }}>{c.craft}</p>
        ) : null}

        {c.sketch ? (
          <img
            src={c.sketch}
            alt={"Sketch of " + c.name}
            style={{ width: "100%", maxWidth: 380, height: "auto", borderRadius: 16, border: "4px solid " + GOLD, marginTop: 16, background: DEEP }}
          />
        ) : null}

        <div style={{ background: DEEP, border: "3px solid " + GOLD, borderRadius: 18, padding: "20px 18px", marginTop: 22, textAlign: "left" }}>
          <p style={{ margin: 0, color: "#fff", lineHeight: 1.6 }}>
            {c.message
              ? c.message
              : c.name + " came through to CREATORS DAY and built with us. Our creative team spent the day behind their vision - content, photos, video, whatever the work needed. This is some of what we made together."}
          </p>
        </div>

        {c.instagram ? (
          <a
            href={"https://instagram.com/" + c.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: 20,
              padding: "16px",
              background: GOLD,
              color: BLUE,
              borderRadius: 14,
              fontFamily: IMPACT,
              fontSize: "1.3rem",
              letterSpacing: 2,
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 5px 0 #0d0c55",
            }}
          >
            Follow @{c.instagram}
          </a>
        ) : null}

        {c.videos && c.videos.length > 0 ? (
          <div style={{ marginTop: 30 }}>
            <p style={{ color: GOLD, fontFamily: IMPACT, letterSpacing: 2, textTransform: "uppercase", fontSize: "1rem" }}>
              What we made together
            </p>
            {c.videos.map(function (v, i) {
              const e = videoEmbed(v);
              if (!e) return null;
              if (e.kind === "iframe") {
                return (
                  <div key={i} style={{ position: "relative", paddingBottom: "177.78%", height: 0, marginTop: 14, borderRadius: 16, overflow: "hidden", border: "3px solid " + GOLD, background: "#000" }}>
                    <iframe
                      src={e.src}
                      title={c.name + " video " + (i + 1)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                    />
                  </div>
                );
              }
              if (e.kind === "video") {
                return (
                  <video key={i} src={e.src} controls playsInline style={{ width: "100%", marginTop: 14, borderRadius: 16, border: "3px solid " + GOLD, background: "#000" }} />
                );
              }
              return (
                <a key={i} href={e.src} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 14, padding: 14, border: "3px solid " + GOLD, borderRadius: 14, color: GOLD, textDecoration: "none", fontFamily: IMPACT, letterSpacing: 1, textTransform: "uppercase" }}>
                  {e.label}
                </a>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#b9b8f5", marginTop: 24, fontSize: "0.95rem" }}>
            Their video is on the way - check back soon.
          </p>
        )}

        <div style={{ marginTop: 36, borderTop: "2px solid #2a29b5", paddingTop: 24 }}>
          <p style={{ color: "#b9b8f5", margin: 0 }}>Want a day like this behind your vision?</p>
          <Link href="/join" style={{ color: GOLD, fontWeight: 700, fontSize: "1.05rem" }}>
            Join the tribe
          </Link>
          <p style={{ marginTop: 18 }}>
            <Link href="/board" style={{ color: "#b9b8f5", fontSize: "0.9rem" }}>
              See the whole board
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
