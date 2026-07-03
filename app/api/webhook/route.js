import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { signTicket } from "@/lib/token";
import { sendConfirmationEmail } from "@/lib/email";
import { syncToBrevo } from "@/lib/brevo";
import { TIERS } from "@/lib/config";

export const dynamic = "force-dynamic";

// Stripe webhook: checkout.session.completed -> order + tickets + QR email + Brevo
export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("[webhook] signature verification failed:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const db = supabaseAdmin();

  // Idempotency: Stripe may retry webhooks
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

  // 1. Order
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

  // 2. One ticket per seat, each with a unique signed token
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

    // 3. Confirmation email (one per ticket so each seat has its own QR)
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

  // 4. Brevo sync (fails soft)
  const synced = await syncToBrevo({
    email,
    name,
    tags: ["culture-in-unity", "tier:" + tierId],
  });
  if (synced) await db.from("orders").update({ brevo_synced: true }).eq("id", order.id);

  return NextResponse.json({ received: true });
}
