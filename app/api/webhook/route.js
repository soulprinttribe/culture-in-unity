import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { signTicket } from "@/lib/token";
import { sendConfirmationEmail, sendSubmissionEmail, sendTeamNotify } from "@/lib/email";
import { syncToBrevo } from "@/lib/brevo";
import { TIERS, ROLES } from "@/lib/config";

export const dynamic = "force-dynamic";

// Stripe webhook: checkout.session.completed -> tickets OR participant submissions
export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("[webhook] signature verification failed:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const db = supabaseAdmin();

  // Participant submissions (artist / vendor) take a different path
  if (session.metadata && session.metadata.type === "submission") {
    return handleSubmission(session, db);
  }

  // --- Ticket purchase path ---
  const { data: dupe } = await db
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (dupe) return NextResponse.json({ received: true, duplicate: true });

  const tierId = session.metadata && session.metadata.tierId;
  const qty = parseInt((session.metadata && session.metadata.quantity) || "1", 10);
  const name = (session.metadata && session.metadata.buyer_name) || (session.customer_details && session.customer_details.name) || "";
  const email = (session.customer_details && session.customer_details.email) || session.customer_email;
  const tier = TIERS[tierId];

  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      email,
      name,
      tier: tierId,
      quantity: qty,
      amount: session.amount_total,
    })
    .select()
    .single();
  if (orderErr) {
    console.error("[webhook] order insert failed:", orderErr.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  for (let i = 0; i < qty; i++) {
    const { data: ticket, error: tErr } = await db
      .from("tickets")
      .insert({
        order_id: order.id,
        tier: tierId,
        holder_name: name,
        holder_email: email,
        status: "valid",
        wristband_color: (tier && tier.wristband) || "",
      })
      .select()
      .single();
    if (tErr) {
      console.error("[webhook] ticket insert failed:", tErr.message);
      continue;
    }

    const token = signTicket(ticket.id);
    const qrUrl = base + "/api/qr/" + encodeURIComponent(token);
    await db.from("tickets").update({ token, qr_url: qrUrl }).eq("id", ticket.id);

    try {
      await sendConfirmationEmail({
        to: email,
        firstName: (name || "friend").split(" ")[0],
        tierId,
        orderNumber: "#" + String(order.id).slice(0, 8).toUpperCase(),
        qrUrl,
        transferUrl: base + "/transfer?token=" + encodeURIComponent(token),
      });
    } catch (e) {
      console.error("[webhook] email failed:", e.message);
    }
  }

  const synced = await syncToBrevo({
    email,
    name,
    tags: ["culture-in-unity", "tier:" + tierId],
  });
  if (synced) await db.from("orders").update({ brevo_synced: true }).eq("id", order.id);

  return NextResponse.json({ received: true });
}

// --- Participant submission path (artist / vendor) ---
async function handleSubmission(session, db) {
  const submissionId = session.metadata.submissionId;
  const role = session.metadata.role;
  const r = ROLES[role] || { label: role, color: "#4b2fd0" };

  const { data: sub } = await db
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!sub) {
    console.error("[webhook] submission not found:", submissionId);
    return NextResponse.json({ received: true });
  }
  if (sub.fee_paid) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const prefix = role === "artist" ? "art_" : "ven_";
  const token = signTicket(prefix + submissionId);
  const qrUrl = base + "/api/qr/" + encodeURIComponent(token);

  await db
    .from("submissions")
    .update({
      fee_paid: true,
      status: "paid",
      amount: session.amount_total,
      stripe_session_id: session.id,
      token,
      qr_url: qrUrl,
      role_color: r.color,
    })
    .eq("id", sub.id);

  const firstName = (sub.name || "friend").split(" ")[0];
  const refNumber = "#" + String(sub.id).slice(0, 8).toUpperCase();

  try {
    await sendSubmissionEmail({
      to: sub.email,
      firstName,
      role,
      refNumber,
      qrUrl,
      details: sub.details || {},
    });
  } catch (e) {
    console.error("[webhook] submission email failed:", e.message);
  }

  try {
    await sendTeamNotify({
      role,
      name: sub.name,
      email: sub.email,
      socials: sub.socials,
      refNumber,
      description: sub.description,
      details: sub.details || {},
      imageUrls: sub.file_urls || [],
    });
  } catch (e) {
    console.error("[webhook] team notify failed:", e.message);
  }

  await syncToBrevo({
    email: sub.email,
    name: sub.name,
    tags: ["culture-in-unity", "role:" + role],
  });

  return NextResponse.json({ received: true });
}
