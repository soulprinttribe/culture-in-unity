import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/token";

export const dynamic = "force-dynamic";

// POST { kind: "order" | "submission", id } - remove a test / refunded entry.
// Order: voids its tickets (frees ticket inventory) + archives the order.
// Submission: marks it unpaid + void (frees the artist/vendor cap).
export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { kind, id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (kind === "order") {
    await db.from("tickets").update({ status: "void" }).eq("order_id", id);
    await db.from("orders").update({ archived: true }).eq("id", id);
    return NextResponse.json({ ok: true });
  }
  if (kind === "submission") {
    await db.from("submissions").update({ fee_paid: false, status: "void" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
