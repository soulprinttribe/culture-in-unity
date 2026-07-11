import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/token";
import { TIERS, ROLES, TOTAL_CAP } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: tickets } = await db
    .from("tickets")
    .select("tier, status")
    .neq("status", "void");
  const { data: orders } = await db.from("orders").select("tier, amount, quantity");

  const byTier = Object.values(TIERS).map((t) => {
    const sold = (tickets || []).filter((x) => x.tier === t.id).length;
    const checkedIn = (tickets || []).filter(
      (x) => x.tier === t.id && x.status === "checked_in"
    ).length;
    const revenue = (orders || [])
      .filter((o) => o.tier === t.id)
      .reduce((s, o) => s + (o.amount || 0), 0);
    return {
      id: t.id,
      name: t.name,
      priceLabel: t.priceLabel,
      cap: t.qty,
      sold,
      remaining: Math.max(0, t.qty - sold),
      checkedIn,
      revenue,
    };
  });

  // --- Participant submissions ---
  const { data: subs } = await db
    .from("submissions")
    .select("id, type, name, email, socials, description, details, file_urls, fee_paid, checked_in, created_at")
    .order("created_at", { ascending: false });
  const paidSubs = (subs || []).filter((s) => s.fee_paid);

  const byRole = Object.values(ROLES).map((r) => {
    const list = paidSubs.filter((s) => s.type === r.id);
    return {
      id: r.id,
      label: r.label,
      feeLabel: r.feeLabel,
      color: r.color,
      cap: r.cap,
      paid: list.length,
      remaining: Math.max(0, r.cap - list.length),
      checkedIn: list.filter((s) => s.checked_in).length,
      revenue: list.length * r.fee,
    };
  });

  const submissions = paidSubs.map((s) => {
    const d = s.details || {};
    return {
      ref: "#" + String(s.id).slice(0, 8).toUpperCase(),
      role: s.type,
      roleLabel: (ROLES[s.type] || {}).label || s.type,
      color: (ROLES[s.type] || {}).color || "#4b2fd0",
      name: s.name,
      email: s.email,
      socials: s.socials || "",
      title: d.title || "",
      description: s.description || "",
      forSale: !!d.forSale,
      price: d.price || "",
      images: s.file_urls || [],
      checkedIn: !!s.checked_in,
    };
  });

  return NextResponse.json({
    byTier,
    totals: {
      sold: (tickets || []).length,
      cap: TOTAL_CAP,
      checkedIn: (tickets || []).filter((x) => x.status === "checked_in").length,
      revenue: byTier.reduce((s, t) => s + t.revenue, 0),
    },
    byRole,
    submissions,
  });
}
