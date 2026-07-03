import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/token";
import { TIERS, TOTAL_CAP } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: tickets } = await db
    .from("tickets")
    .select("tier, status")
    .neq("status", "void");
  const { data: orders } = await db.from("orders").select("tier, amount, quantity");

  const byTier = Object.values(TIERS).map((t) => {
    const sold = (tickets || []).filter((x) => x.tier === t.id).length;
    const checkedIn = (tickets || []).filter(
      (x) => x.tier === t.id && x.status === "checked_in"
    ).length;
    const revenue = (orders || [])
      .filter((o) => o.tier === t.id)
      .reduce((s, o) => s + (o.amount || 0), 0);
    return {
      id: t.id,
      name: t.name,
      priceLabel: t.priceLabel,
      cap: t.qty,
      sold,
      remaining: Math.max(0, t.qty - sold),
      checkedIn,
      revenue,
    };
  });

  return NextResponse.json({
    byTier,
    totals: {
      sold: (tickets || []).length,
      cap: TOTAL_CAP,
      checkedIn: (tickets || []).filter((x) => x.status === "checked_in").length,
      revenue: byTier.reduce((s, t) => s + t.revenue, 0),
    },
  });
}
