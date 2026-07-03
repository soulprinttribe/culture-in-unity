import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { TIERS, TOTAL_CAP, EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

// POST { tierId, quantity, name, email } -> Stripe Checkout session URL
export async function POST(request) {
  try {
    const { tierId, quantity = 1, name = "", email = "" } = await request.json();
    const tier = TIERS[tierId];
    const qty = Math.max(1, Math.min(10, parseInt(quantity, 10) || 1));
    if (!tier) {
      return NextResponse.json({ error: "Unknown ticket tier." }, { status: 400 });
    }

    // Inventory check (no overselling). Fails closed for the tier cap.
    const db = supabaseAdmin();
    const { data: existing, error } = await db
      .from("tickets")
      .select("tier")
      .neq("status", "void");
    if (error) throw error;
    const totalSold = existing.length;
    const tierSold = existing.filter((t) => t.tier === tierId).length;
    if (tierSold + qty > tier.qty || totalSold + qty > TOTAL_CAP) {
      return NextResponse.json(
        { error: tier.name + " is sold out (or not enough remaining for " + qty + ")." },
        { status: 409 }
      );
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: "usd",
            unit_amount: tier.price, // SOULPRINT absorbs Stripe fees - price is final
            product_data: {
              name: EVENT.name + " - " + tier.name,
              description: EVENT.dateLabel + ", " + EVENT.timeLabel + " - " + EVENT.venueName,
            },
          },
        },
      ],
      metadata: { tierId, quantity: String(qty), buyer_name: name },
      success_url: base + "/tickets/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: base + "/tickets",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e.message);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
