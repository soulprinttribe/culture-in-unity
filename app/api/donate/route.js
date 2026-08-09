import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

// POST { amount, note } -> Stripe Checkout for a donation of any size.
// metadata.type = "donation" so the webhook records it and never makes a ticket.
export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Math.round(parseFloat(body.amount) * 100);
    const note = String(body.note || "").trim().slice(0, 400);

    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json({ error: "Please enter an amount of $1 or more." }, { status: 400 });
    }
    if (amount > 1000000) {
      return NextResponse.json({ error: "For gifts over $10,000, please reach out to us directly." }, { status: 400 });
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: "FUND THE TRIBE",
              description: "A gift to " + EVENT.host + " - keeping every gathering free and open.",
            },
          },
        },
      ],
      metadata: { type: "donation", note: note },
      success_url: base + "/fund/thankyou",
      cancel_url: base + "/fund",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[donate]", e.message);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
