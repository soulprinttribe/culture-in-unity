import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { syncToBrevo } from "@/lib/brevo";
import { EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

// POST { name, email, bringing, source } -> record an RSVP for the free gathering.
// No payment, no ticket. Just so we know who is coming and can send details.
export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const bringing = String(body.bringing || "").trim().slice(0, 300);
    const source = String(body.source || "").trim().slice(0, 100);

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    // Save the RSVP. Fails soft - the Brevo sync still happens either way,
    // so a missing table never costs us the contact.
    let saved = false;
    try {
      const db = supabaseAdmin();
      const { error } = await db.from("rsvps").insert({
        name,
        email,
        bringing,
        source,
        event: EVENT.name,
      });
      if (!error) saved = true;
      else console.error("[rsvp] insert failed:", error.message);
    } catch (e) {
      console.error("[rsvp] db unavailable:", e.message);
    }

    // Add them to the list either way.
    try {
      await syncToBrevo({
        email,
        name,
        tags: ["souls-in-the-park", "rsvp"],
      });
    } catch (e) {
      console.error("[rsvp] brevo sync failed:", e.message);
    }

    return NextResponse.json({ ok: true, saved });
  } catch (e) {
    console.error("[rsvp]", e.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
