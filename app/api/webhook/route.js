import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { signTicket } from "@/lib/token";
import { sendConfirmationEmail } from "@/lib/email";
import { syncToBrevo } from "@/lib/brevo";
import { Resend } from "resend";
import { TIERS, EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

function thankYouHtml(firstName, amountLabel) {
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#19189A;font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;">'
    + '<div style="max-width:600px;margin:0 auto;padding:20px;">'
    + '<div style="background:#19189A;border:3px solid #E5E630;border-radius:22px 22px 0 0;padding:28px 24px 26px;text-align:center;">'
    + '<p style="margin:0 0 8px;color:#ffffff;font-family:Impact,Arial Narrow Bold,sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;">' + EVENT.host + '</p>'
    + '<p style="margin:0;color:#E5E630;font-family:Impact,Haettenschweiler,Arial Narrow Bold,sans-serif;font-size:44px;line-height:0.95;letter-spacing:1px;">YOU PLANTED<br/>SOMETHING</p>'
    + '</div>'
    + '<div style="height:9px;background:linear-gradient(90deg,#19189A,#E5E630,#19189A);"></div>'
    + '<div style="background:#ffffff;border-radius:0 0 22px 22px;padding:28px 24px;">'
    + '<p style="font-size:18px;margin:0 0 6px;">Peace and blessings, ' + firstName + '</p>'
    + '<p style="margin:0 0 4px;">Your gift of <strong>' + amountLabel + '</strong> just became part of the vision.</p>'
    + '<p style="margin:14px 0 0;">Here is what that actually means: sound for the circle. Art supplies in hands that need them. Space for the tribe to gather. And doors that stay open to anyone who feels the call - no ticket, no barrier, no one turned away.</p>'
    + '<p style="margin:14px 0 0;">Everything we gather stays free because of people like you. You did not just give money - you gave someone their first circle, their first drum, their first time feeling like they belong.</p>'
    + '<p style="margin:14px 0 0;">What you plant here is what grows.</p>'
    + '<p style="margin:18px 0 0;font-style:italic;">Walk in a stranger. Leave with a tribe.</p>'
    + '<p style="margin:18px 0 0;font-size:13px;color:#777;">' + EVENT.host + ' &middot; @soulprinttribe</p>'
    + '</div></div></body></html>';
}

// Stripe webhook: checkout.session.completed -> order + tickets + QR email + Brevo
// Donations (metadata.type = donation) are recorded + thanked, never ticketed.
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

  if (session.metadata && session.metadata.type === "donation") {
    const demail = (session.customer_details && session.customer_details.email) || "";
    const dname = (session.customer_details && session.customer_details.name) || "";
    try {
      const { error } = await db.from("donations").insert({
        stripe_session_id: session.id,
        email: demail,
        name: dname,
        amount: session.amount_total,
        note: session.metadata.note || "",
      });
      if (error) console.error("[webhook] donation insert failed:", error.message);
    } catch (e) {
      console.error("[webhook] donation insert failed:", e.message);
    }
    if (demail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "SOULPRINT COLLECTIVE <onboarding@resend.dev>",
          to: demail,
          subject: "You planted something",
          html: thankYouHtml((dname || "friend").split(" ")[0], "$" + (session.amount_total / 100).toFixed(2)),
        });
      } catch (e) {
        console.error("[webhook] thank you email failed:", e.message);
      }
      try {
        await syncToBrevo({ email: demail, name: dname, tags: ["tribe", "funder"] });
      } catch (e) {
        console.error("[webhook] donor brevo sync failed:", e.message);
      }
    }
    return NextResponse.json({ received: true, donation: true });
  }

  if (session.metadata && session.metadata.type) {
    return NextResponse.json({ received: true, skipped: session.metadata.type });
  }

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
