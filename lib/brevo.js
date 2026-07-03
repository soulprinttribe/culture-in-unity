// Brevo contact sync - every buyer/applicant funnels into SOULPRINT's Brevo.
// Fails soft: a Brevo outage must never break a sale.
export async function syncToBrevo({ email, name, tags = [] }) {
    const key = process.env.BREVO_API_KEY;
    if (!key) {
          console.log("[brevo] no API key set - skipping sync for", email);
          return false;
    }
    try {
          const body = {
                  email,
                  attributes: { FIRSTNAME: (name || "").split(" ")[0] || "" },
                  updateEnabled: true,
          };
          const listId = parseInt(process.env.BREVO_LIST_ID || "", 10);
          if (!isNaN(listId)) body.listIds = [listId];

      const res = await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST",
              headers: { "api-key": key, "Content-Type": "application/json" },
              body: JSON.stringify(body),
      });
          if (!res.ok && res.status !== 204) {
                  const txt = await res.text();
                  console.error("[brevo] sync failed:", res.status, txt);
                  return false;
          }
          return true;
    } catch (e) {
          console.error("[brevo] error:", e.message);
          return false;
    }
}
