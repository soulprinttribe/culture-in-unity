import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/token";
import { TIERS } from "@/lib/config";

export const dynamic = "force-dynamic";

function csv(rows, headers) {
  const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

// GET ?type=doorlist | subscribers -> CSV download
export async function GET(request) {
  if (!requireAdmin(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const db = supabaseAdmin();
  const type = new URL(request.url).searchParams.get("type") || "doorlist";

  let body, filename;
  if (type === "subscribers") {
    const { data } = await db.from("orders").select("name, email, tier, created_at");
    body = csv(data || [], ["name", "email", "tier", "created_at"]);
    filename = "subscribers.csv";
  } else {
    const { data } = await db
      .from("tickets")
      .select("holder_name, holder_email, tier, status, wristband_color, checked_in_at");
    const rows = (data || []).map((t) => ({
      ...t,
      tier: (TIERS[t.tier] || {}).name || t.tier,
    }));
    body = csv(rows, ["holder_name", "holder_email", "tier", "status", "wristband_color", "checked_in_at"]);
    filename = "door-list.csv";
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="' + filename + '"',
    },
  });
}
