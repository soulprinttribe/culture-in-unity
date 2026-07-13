import { createClient } from "@supabase/supabase-js";

// Force every Supabase query to bypass Next.js's fetch Data Cache, so all
// reads (admin stats, inventory, check-in, caps) are always LIVE, never stale.
const noStoreFetch = (url, options = {}) => fetch(url, { ...options, cache: "no-store" });

// Server-side client (service role - full access; never expose to browser)
export function supabaseAdmin() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        global: { fetch: noStoreFetch },
      }
        );
}
