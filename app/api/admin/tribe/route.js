import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/token";

export const dynamic = "force-dynamic";

// GET -> everyone who joined the tribe + everyone who funded the vision.
// Both tables fail soft so one missing table never blanks the whole page.
export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();

  let tribe = [];
  try {
    const { data, error } = await db
      .from("tribe")
      .select("name, email, source, created_at")
      .order("created_at", { ascending: false });
    if (error) console.error("[admin/tribe] tribe:", error.message);
    else tribe = data || [];
  } catch (e) {
    console.error("[admin/tribe] tribe unavailable:", e.message);
  }

  let donations = [];
  try {
    const { data, error } = await db
      .from("donations")
      .select("name, email, amount, note, created_at")
      .order("created_at", { ascending: false });
    if (error) console.error("[admin/tribe] donations:", error.message);
    else donations = data || [];
  } catch (e) {
    console.error("[admin/tribe] donations unavailable:", e.message);
  }

  let rsvps = [];
  try {
    const { data, error } = await db
      .from("rsvps")
      .select("name, email, bringing, source, created_at")
      .order("created_at", { ascending: false });
    if (error) console.error("[admin/tribe] rsvps:", error.message);
    else rsvps = data || [];
  } catch (e) {
    console.error("[admin/tribe] rsvps unavailable:", e.message);
  }

  const raised = donations.reduce(function (s, d) { return s + (d.amount || 0); }, 0);

  return NextResponse.json({
    tribe: tribe,
    donations: donations,
    rsvps: rsvps,
    totals: {
      tribeCount: tribe.length,
      rsvpCount: rsvps.length,
      donationCount: donations.length,
      raised: raised,
    },
  });
}
