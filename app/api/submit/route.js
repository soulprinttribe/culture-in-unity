import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { ROLES, EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

// GET ?role=artist|vendor -> remaining spots
export async function GET(request) {
  const role = new URL(request.url).searchParams.get("role");
  const r = ROLES[role];
  if (!r) return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  const db = supabaseAdmin();
  const { data } = await db
    .from("submissions")
    .select("id")
    .eq("type", role)
    .eq("fee_paid", true);
  const taken = (data || []).length;
  return NextResponse.json({
    role,
    label: r.label,
    feeLabel: r.feeLabel,
    cap: r.cap,
    taken,
    remaining: Math.max(0, r.cap - taken),
  });
}

// POST multipart form -> upload images, save submission, open Stripe checkout
export async function POST(request) {
  try {
    const form = await request.formData();
    const role = (form.get("role") || "").toString();
    const r = ROLES[role];
    if (!r) return NextResponse.json({ error: "Unknown role." }, { status: 400 });

    const db = supabaseAdmin();

    // Cap check (counts only paid spots)
    const { data: paid } = await db
      .from("submissions")
      .select("id")
      .eq("type", role)
      .eq("fee_paid", true);
    if ((paid || []).length >= r.cap) {
      return NextResponse.json(
        { error: r.label + " spots are full for this event." },
        { status: 409 }
      );
    }

    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const socials = (form.get("socials") || "").toString().trim();
    const description = (form.get("description") || "").toString().trim();
    const contractName = (form.get("contractName") || "").toString().trim();
    let details = {};
    try { details = JSON.parse((form.get("details") || "{}").toString()); } catch (e) { details = {}; }

    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
    }
    if (!contractName) {
      return NextResponse.json({ error: "Please type your name to sign the agreement." }, { status: 400 });
    }

    // Upload up to 5 images to the public submission-images bucket
    const files = form.getAll("images").filter((f) => f && typeof f === "object" && f.size > 0);
    const imageUrls = [];
    for (let i = 0; i < files.length && i < 5; i++) {
      const file = files[i];
      let ext = "jpg";
      if (file.name && file.name.includes(".")) {
        ext = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      }
      const path = role + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await db.storage
        .from("submission-images")
        .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: false });
      if (upErr) { console.error("[submit] upload failed:", upErr.message); continue; }
      const { data: pub } = db.storage.from("submission-images").getPublicUrl(path);
      if (pub && pub.publicUrl) imageUrls.push(pub.publicUrl);
    }

    const { data: sub, error: insErr } = await db
      .from("submissions")
      .insert({
        type: role,
        name,
        email,
        socials,
        description,
        details,
        file_urls: imageUrls,
        contract_name: contractName,
        contract_signed_at: new Date().toISOString(),
        role_color: r.color,
        status: "pending",
        fee_paid: false,
      })
      .select()
      .single();
    if (insErr) {
      console.error("[submit] insert failed:", insErr.message);
      return NextResponse.json({ error: "Could not save your submission. Please try again." }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: r.fee,
            product_data: {
              name: EVENT.name + " - " + r.label + " Spot",
              description: r.label + " participation - " + EVENT.dateLabel + ", " + EVENT.venueName,
            },
          },
        },
      ],
      metadata: { type: "submission", submissionId: String(sub.id), role },
      success_url: base + "/submit/success?role=" + role,
      cancel_url: base + "/submit/" + role,
    });

    await db.from("submissions").update({ stripe_session_id: session.id }).eq("id", sub.id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[submit]", e.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
