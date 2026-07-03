import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTicket } from "@/lib/token";
import { sendConfirmationEmail } from "@/lib/email";
import { syncToBrevo } from "@/lib/brevo";

export const dynamic = "force-dynamic";

// POST { token, newName, newEmail } - reassign a ticket (transferable, no refunds)
export async function POST(request) {
  const { token, newName, newEmail } = await request.json();
  const ticketId = verifyTicket(token);
  if (!ticketId) {
    return NextResponse.json({ error: "Invalid ticket link." }, { status: 400 });
  }
  if (!newName || !newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return NextResponse.json({ error: "Please provide the recipient's name and a valid email." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: ticket } = await db.from("tickets").select("*").eq("id", ticketId).maybeSingle();
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (ticket.status === "checked_in") {
    return NextResponse.json({ error: "This ticket was already used at the door." }, { status: 409 });
  }
  if (ticket.status === "void") {
    return NextResponse.json({ error: "This ticket is no longer valid." }, { status: 409 });
  }

  await db
    .from("tickets")
    .update({ holder_name: newName, holder_email: newEmail })
    .eq("id", ticket.id);

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    await sendConfirmationEmail({
      to: newEmail,
      firstName: newName.split(" ")[0],
      tierId: ticket.tier,
      orderNumber: "#" + String(ticket.order_id).slice(0, 8).toUpperCase(),
      qrUrl: ticket.qr_url || base + "/api/qr/" + encodeURIComponent(token),
      transferUrl: base + "/transfer?token=" + encodeURIComponent(token),
    });
  } catch (e) {
    console.error("[transfer] email failed:", e.message);
  }
  await syncToBrevo({ email: newEmail, name: newName, tags: ["culture-in-unity", "transferred"] });

  return NextResponse.json({ ok: true, message: "Ticket transferred to " + newName + ". They'll receive their QR by email." });
}
