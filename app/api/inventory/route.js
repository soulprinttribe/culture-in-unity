import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TIERS, TOTAL_CAP } from "@/lib/config";

export const dynamic = "force-dynamic";

// Public: remaining inventory per tier (so /tickets can show sold-out states)
export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("tickets")
      .select("tier")
      .neq("status", "void");
    if (error) throw error;

    const sold = {};
    for (const t of data) sold[t.tier] = (sold[t.tier] || 0) + 1;
    const totalSold = data.length;

    const tiers = Object.values(TIERS).map((t) => ({
      id: t.id,
      name: t.name,
      priceLabel: t.priceLabel,
      includesFood: t.includesFood,
      blurb: t.blurb,
      remaining: Math.max(
        0,
        Math.min(t.qty - (sold[t.id] || 0), TOTAL_CAP - totalSold)
      ),
    }));
    return NextResponse.json({ tiers, totalSold, cap: TOTAL_CAP });
  } catch (e) {
    // If DB is unreachable, never block the page - show tiers as available.
    const tiers = Object.values(TIERS).map((t) => ({
      id: t.id, name: t.name, priceLabel: t.priceLabel,
      includesFood: t.includesFood, blurb: t.blurb, remaining: t.qty,
    }));
    return NextResponse.json({ tiers, totalSold: null, cap: TOTAL_CAP });
  }
}
