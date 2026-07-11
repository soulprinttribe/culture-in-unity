import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTicket, requireAdmin } from "@/lib/token";
import { TIERS, ROLES, TOTAL_CAP } from "@/lib/config";

export const dynamic = "force-dynamic";

async function headcount(db) {
  const { count } = await db
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("status", "checked_in");
  return count || 0;
}

// Handle an artist/vendor role pass (token id prefixed art_/ven_)
async function checkinSubmission(db, rawId) {
  const role = rawId.startsWith("art_") ? "artist" : "vendor";
  const subId = rawId.slice(4);
  const r = ROLES[role] || { label: role, color: "#4b2fd0" };

  const { data: sub } = await db
    .from("submissions")
    .select("*")
    .eq("id", subId)
    .maybeSingle();

  if (!sub) {
    return NextResponse.json({ ok: false, reason: "NOT_FOUND", message: "Pass not found." }, { status: 404 });
  }
  if (!sub.fee_paid) {
    return NextResponse.json({ ok: false, reason: "UNPAID", message: "This pass has not been paid." });
  }
  if (sub.checked_in) {
    return NextResponse.json({
      ok: false,
      reason: "ALREADY_USED",
      message: "Already checked in at " + new Date(sub.checked_in_at).toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      ticket: { name: sub.name, tier: r.label, role, roleColor: sub.role_color || r.color },
      headcount: await headcount(db),
      cap: TOTAL_CAP,
    });
  }

  await db
    .from("submissions")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", sub.id);

  return NextResponse.json({
    ok: true,
    message: "Welcome in!",
    ticket: {
      name: sub.name,
      email: sub.email,
      tier: r.label,
      role,
      roleColor: sub.role_color || r.color,
    },
    headcount: await headcount(db),
    cap: TOTAL_CAP,
  });
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

  // Artist / vendor role pass
  if (typeof ticketId === "string" && (ticketId.startsWith("art_") || ticketId.startsWith("ven_"))) {
    return checkinSubmission(db, ticketId);
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
    return NextResponse.json({ ok: false, reason: "VOID", message: "This ticket was voided." });
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
