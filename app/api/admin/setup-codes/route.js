import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/token";

export const dynamic = "force-dynamic";

// [ code, group ]  - main cast = 50% off, extras = 20% off. All single-use.
const CODES = [
  ["EZRA", "cast50"], ["AMARADAZE", "cast50"], ["AXIOM", "cast50"], ["YAXIN", "cast50"],
  ["IDRIS", "cast50"], ["CATO", "cast50"], ["REMI", "cast50"], ["ZURI", "cast50"],
  ["MAMAASHA", "cast50"], ["GATEKEEPER", "cast50"], ["KAYALUCERO", "cast50"], ["KAYANEOSHA", "cast50"],
  ["KHEPRI", "cast50"],
  ["ELI", "extras20"], ["JAH", "extras20"], ["AB", "extras20"], ["BRI", "extras20"], ["MK", "extras20"], ["SAMMY", "extras20"],
];

async function getOrCreateCoupon(s, key) {
  const pct = key === "cast50" ? 50 : 20;
  const name = key === "cast50" ? "DYSTOPIA 2077 Cast - 50% off" : "DYSTOPIA 2077 Extras - 20% off";
  const existing = await s.coupons.list({ limit: 100 });
  const found = (existing.data || []).find((c) => c.metadata && c.metadata.ciu_key === key);
  if (found) return found;
  return s.coupons.create({ percent_off: pct, duration: "once", name, metadata: { ciu_key: key } });
}

export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = stripe();
  const results = [];
  try {
    const coupon50 = await getOrCreateCoupon(s, "cast50");
    const coupon20 = await getOrCreateCoupon(s, "extras20");
    const couponId = { cast50: coupon50.id, extras20: coupon20.id };

    const existingCodes = await s.promotionCodes.list({ limit: 100 });
    const existingSet = new Set((existingCodes.data || []).map((p) => p.code));

    for (let i = 0; i < CODES.length; i++) {
      const code = CODES[i][0];
      const key = CODES[i][1];
      if (existingSet.has(code)) { results.push(code + " - already exists"); continue; }
      try {
        await s.promotionCodes.create({ coupon: couponId[key], code, max_redemptions: 1 });
        results.push(code + " - created (" + (key === "cast50" ? "50%" : "20%") + ")");
      } catch (e) {
        results.push(code + " - ERROR: " + e.message);
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message, results });
  }
}
