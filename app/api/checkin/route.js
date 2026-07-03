import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTicket, requireAdmin } from "@/lib/token";
import { TIERS, TOTAL_CAP } from "@/lib/config";

export const dynamic = "force-dynamic";

async function headcount(db) {
  const { count } = await db
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("status", "checked_in");
  return count || 0;
}

// POST { token } - scan a QR; or POST { ticketId, manual: true } - will-call check-in
export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const body = await request.json();

  let ticketId;
  if (body.manual && body.ticketId) {
    ticketId = body.ticketId;
  } else {
    ticketId = verifyTicket(body.token);
    if (!ticketId) {
      return NextResponse.json(
        { ok: false, reason: "INVALID", message: "Invalid or forged QR code." },
        { status: 400 }
      );
    }
  }

  const { data: ticket } = await db
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) {
    return NextResponse.json(
      { ok: false, reason: "NOT_FOUND", message: "Ticket not found." },
      { status: 404 }
    );
  }
  if (ticket.status === "checked_in") {
    return NextResponse.json({
      ok: false,
      reason: "ALREADY_USED",
      message: "Already checked in at " + new Date(ticket.checked_in_at).toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      ticket: { name: ticket.holder_name, tier: (TIERS[ticket.tier] || {}).name || ticket.tier },
      headcount: await headcount(db),
      cap: TOTAL_CAP,
    });
  }
  if (ticket.status === "void") {
    return NextResponse.json({
      ok: false, reason: "VOID", message: "This ticket was voided.",
    });
  }

  await db
    .from("tickets")
    .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
    .eq("id", ticket.id);

  const tier = TIERS[ticket.tier];
  return NextResponse.json({
    ok: true,
    message: "Welcome in!",
    ticket: {
      name: ticket.holder_name,
      email: ticket.holder_email,
      tier: (tier && tier.name) || ticket.tier,
      wristband: ticket.wristband_color || (tier && tier.wristband) || "",
      includesFood: !!(tier && tier.includesFood),
    },
    headcount: await headcount(db),
    cap: TOTAL_CAP,
  });
}

// GET ?q=searchterm - will-call search by name/email; GET with no q - live count
export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const q = new URL(request.url).searchParams.get("q");

  if (!q) {
    return NextResponse.json({ headcount: await headcount(db), cap: TOTAL_CAP });
  }

  const { data } = await db
    .from("tickets")
    .select("id, holder_name, holder_email, tier, status, wristband_color")
    .or("holder_name.ilike.%" + q + "%,holder_email.ilike.%" + q + "%")
    .limit(20);

  return NextResponse.json({
    results: (data || []).map((t) => ({
      ...t,
      tierName: (TIERS[t.tier] || {}).name || t.tier,
    })),
    headcount: await headcount(db),
    cap: TOTAL_CAP,
  });
}
