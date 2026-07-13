import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/token";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const list = await stripe().promotionCodes.list({ limit: 100 });
    const codes = (list.data || []).map((p) => {
      const c = p.coupon || {};
      const off = c.percent_off ? c.percent_off + "% off" : (c.amount_off ? "$" + (c.amount_off / 100) + " off" : "-");
      return {
        code: p.code,
        off,
        pct: c.percent_off || 0,
        redeemed: p.times_redeemed || 0,
        max: p.max_redemptions || null,
        active: !!p.active,
      };
    }).sort((a, b) => b.pct - a.pct || a.code.localeCompare(b.code));
    return NextResponse.json({ codes });
  } catch (e) {
    console.error("[codes]", e.message);
    return NextResponse.json({ codes: [], error: e.message });
  }
}
