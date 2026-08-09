import { NextResponse } from "next/server";
import { Resend } from "resend";
import { syncToBrevo } from "@/lib/brevo";
import { supabaseAdmin } from "@/lib/supabase";
import { EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

const DISCORD_INVITE = process.env.DISCORD_INVITE_URL || "";

function welcomeHtml(firstName) {
  const discordBlock = DISCORD_INVITE
    ? '<div style="text-align:center;margin:26px 0;"><a href="' + DISCORD_INVITE + '" style="display:inline-block;background:#E5E630;color:#19189A;font-family:Impact,Arial Narrow Bold,sans-serif;font-size:20px;letter-spacing:1px;text-decoration:none;padding:14px 34px;border-radius:14px;border:3px solid #19189A;">JOIN THE DISCORD</a><p style="margin:12px 0 0;font-size:13px;color:#555;">This is where the tribe lives between gatherings.</p></div>'
    : '<p style="margin:18px 0;">Our Discord invite is on its way to you in a follow-up note very soon.</p>';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#19189A;font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;">'
    + '<div style="max-width:600px;margin:0 auto;padding:20px;">'
    + '<div style="background:#19189A;border:3px solid #E5E630;border-radius:22px 22px 0 0;padding:28px 24px 26px;text-align:center;">'
    + '<p style="margin:0 0 8px;color:#ffffff;font-family:Impact,Arial Narrow Bold,sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;">' + EVENT.host + '</p>'
    + '<p style="margin:0;color:#E5E630;font-family:Impact,Haettenschweiler,Arial Narrow Bold,sans-serif;font-size:44px;line-height:0.95;letter-spacing:1px;">WELCOME TO<br/>THE TRIBE</p>'
    + '</div>'
    + '<div style="background:#ffffff;border-radius:0 0 22px 22px;padding:28px 24px;">'
    + '<p style="font-size:18px;margin:0 0 6px;">Peace and blessings, ' + firstName + '</p>'
    + '<p style="margin:0 0 4px;">You found the tribe. That was not an accident.</p>'
    + '<p style="margin:14px 0 0;">We are artists, creators, and souls building a world rooted in community - gathering in parks, in circles, in sound. You will be first to know about everything we create.</p>'
    + discordBlock
    + '<p style="margin:14px 0 0;font-style:italic;">Walk in a stranger. Leave with a tribe.</p>'
    + '<p style="margin:18px 0 0;font-size:13px;color:#777;">' + EVENT.host + ' &middot; @soulprinttribe</p>'
    + '</div></div></body></html>';
}

// POST { name, email } -> tribe table + Brevo list + instant welcome email with Discord invite.
export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    // 1. Record in our own table (fails soft - never blocks the welcome).
    try {
      const db = supabaseAdmin();
      const { error } = await db.from("tribe").insert({ name, email, source: "join-page" });
      if (error) console.error("[join] tribe insert failed:", error.message);
    } catch (e) {
      console.error("[join] db unavailable:", e.message);
    }

    // 2. Brevo list (fails soft).
    try {
      await syncToBrevo({ email, name, tags: ["tribe", "join-the-tribe"] });
    } catch (e) {
      console.error("[join] brevo sync failed:", e.message);
    }

    // 3. Instant welcome email with the Discord invite.
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "SOULPRINT COLLECTIVE <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to the tribe",
        html: welcomeHtml((name || "friend").split(" ")[0]),
      });
    } catch (e) {
      console.error("[join] welcome email failed:", e.message);
      return NextResponse.json(
        { error: "We could not send your welcome email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[join]", e.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
