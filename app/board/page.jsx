import Link from "next/link";
import { CREATORS } from "@/lib/board";

const BLUE = "#19189A";
const GOLD = "#E5E630";
const DEEP = "#100f6e";
const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

export const metadata = { title: "Tribe Appreciation Board - SOULPRINT" };

export default function BoardPage() {
  const wrap = {
    minHeight: "100vh",
    background: BLUE,
    padding: "44px 20px 80px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#fff",
  };

  return (
    <main style={wrap}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontFamily: IMPACT, color: GOLD, fontSize: "clamp(2.4rem, 10vw, 3.8rem)", lineHeight: 0.95, textTransform: "uppercase", margin: 0, textAlign: "center" }}>
          Tribe<br />Appreciation<br />Board
        </h1>

        <p style={{ color: "#fff", textAlign: "center", maxWidth: 520, margin: "22px auto 0", lineHeight: 1.6, fontSize: "1.05rem" }}>
          These are creators who came through CREATORS DAY.
        </p>
        <p style={{ color: "#b9b8f5", textAlign: "center", maxWidth: 520, margin: "12px auto 0", lineHeight: 1.6 }}>
          For one day our whole creative team got behind their vision - brand photos,
          music videos, content, whatever the work needed. No cost, no catch. A brother
          came through and sketched every person there, and those sketches became this board.
        </p>
        <p style={{ color: "#b9b8f5", textAlign: "center", maxWidth: 520, margin: "12px auto 0", lineHeight: 1.6 }}>
          We carry it to every gathering. This is the first of many.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 34 }}>
          {CREATORS.map(function (c) {
            return (
              <Link
                key={c.slug}
                href={"/board/" + c.slug}
                style={{ display: "block", background: DEEP, border: "3px solid " + GOLD, borderRadius: 18, padding: 14, textDecoration: "none", textAlign: "center" }}
              >
                {c.sketch ? (
                  <img src={c.sketch} alt={"Sketch of " + c.name} style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }} />
                ) : (
                  <div style={{ width: "100%", paddingBottom: "100%", borderRadius: 12, background: "#1b1a8c", position: "relative" }}>
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6360d8", fontFamily: IMPACT, letterSpacing: 2, fontSize: "0.9rem" }}>
                      SKETCH
                    </span>
                  </div>
                )}
                <p style={{ margin: "12px 0 0", color: GOLD, fontFamily: IMPACT, fontSize: "1.4rem", letterSpacing: 1, textTransform: "uppercase" }}>
                  {c.name}
                </p>
                {c.craft ? <p style={{ margin: "2px 0 0", color: "#b9b8f5", fontSize: "0.88rem" }}>{c.craft}</p> : null}
              </Link>
            );
          })}
        </div>

        <div style={{ background: DEEP, border: "3px solid " + GOLD, borderRadius: 18, padding: "22px 20px", marginTop: 34, textAlign: "center" }}>
          <p style={{ margin: 0, color: "#fff", lineHeight: 1.6 }}>
            Want your vision behind our whole team next time?
          </p>
          <Link
            href="/join"
            style={{ display: "inline-block", marginTop: 14, padding: "14px 28px", background: GOLD, color: BLUE, borderRadius: 14, fontFamily: IMPACT, fontSize: "1.2rem", letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", boxShadow: "0 5px 0 #0d0c55" }}
          >
            Join The Tribe
          </Link>
        </div>

        <p style={{ color: "#b9b8f5", textAlign: "center", marginTop: 30, fontStyle: "italic" }}>
          Walk in a stranger. Leave with a tribe.
        </p>
      </div>
    </main>
  );
}
