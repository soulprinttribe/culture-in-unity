import { Resend } from "resend";
import { EVENT, TIERS } from "./config";

// Confirmation email - 3 near-identical templates (brief section 8).
// Sent from the domain (SPF/DKIM via Resend). Reply-to Gmail.

const WHAT_TO_BRING = `
<li>Bring: your ID, an open heart, comfortable shoes to dance in, and cash/card for the marketplace and food vendors.</li>
<li>Leave at home: outside food &amp; drink, weapons of any kind, and bad vibes. Security will be present so everyone can feel safe and free.</li>`;

const TRANSIT = `
<li><strong>Subway:</strong> L train to Jefferson St - the venue is a short walk from the station.</li>
<li><strong>Bus:</strong> B57 / B38 stop nearby.</li>
<li><strong>Driving:</strong> street parking in Bushwick is limited - transit is the easeful path.</li>`;

function ticketHtml({ firstName, tierId, orderNumber, qrUrl, transferUrl }) {
    const tier = TIERS[tierId] || { name: tierId, includesFood: false };
    const foodNote = tier.includesFood
      ? `<p style="background:#1a7f4e;color:#fff;padding:10px 16px;border-radius:10px;font-weight:bold;">Your ticket includes a cultural food plate - show your wristband at the food tables.</p>`
          : "";

  return `<!DOCTYPE html>
  <html><body style="margin:0;padding:0;background:#12142e;font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(180deg,#4f8fe8 0%,#2b4bb5 100%);border-radius:20px;padding:32px 24px;text-align:center;">
        <p style="color:#f5e829;font-size:28px;font-weight:900;letter-spacing:1px;margin:0;text-shadow:2px 2px 0 #4b2fd0;">CULTURE IN UNITY</p>
            <p style="color:#fff;margin:6px 0 0;font-style:italic;">${EVENT.tagline} - ${EVENT.tagline2}</p>
              </div>

                <div style="background:#fff;border-radius:20px;padding:28px 24px;margin-top:16px;">
                    <p style="font-size:18px;">Peace and blessings, ${firstName}</p>
                        <p>Your place inside the portal is confirmed. We can't wait to celebrate with you - many cultures, one soul.</p>

                            <div style="text-align:center;margin:24px 0;">
                                  <img src="${qrUrl}" alt="Your ticket QR code" width="220" height="220" style="border:6px solid #f5e829;border-radius:16px;"/>
                                        <p style="margin:10px 0 0;font-weight:bold;">${tier.name} - Order ${orderNumber}</p>
                                              <p style="margin:4px 0 0;font-size:13px;color:#555;">Show this QR at the door. Screenshots are fine - each ticket scans once.</p>
                                                  </div>

                                                      ${foodNote}

                                                          <h3 style="color:#4b2fd0;margin-bottom:6px;">The essentials</h3>
                                                              <ul style="padding-left:18px;line-height:1.6;">
                                                                    <li><strong>${EVENT.dateLabel}, ${EVENT.timeLabel}</strong></li>
                                                                          <li><strong>${EVENT.venueName}</strong>, ${EVENT.venueAddress}</li>
                                                                              </ul>

                                                                                  <h3 style="color:#4b2fd0;margin-bottom:6px;">What to bring</h3>
                                                                                      <ul style="padding-left:18px;line-height:1.6;">${WHAT_TO_BRING}</ul>

                                                                                          <h3 style="color:#4b2fd0;margin-bottom:6px;">Getting there</h3>
                                                                                              <ul style="padding-left:18px;line-height:1.6;">${TRANSIT}</ul>

                                                                                                  <p style="margin-top:20px;">Can't make it? Your ticket is transferable (no refunds) - gift it to someone whose soul needs this:</p>
                                                                                                      <p style="text-align:center;"><a href="${transferUrl}" style="background:#f5e829;color:#4b2fd0;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px;display:inline-block;">Transfer / gift this ticket</a></p>
                                                                                                      
                                                                                                          <p style="margin-top:24px;">Follow the journey and join the community - this portal is only the beginning.</p>
                                                                                                              <p style="font-weight:bold;">Peace and blessings,<br/>SOULPRINT COLLECTIVE</p>
                                                                                                                </div>
                                                                                                                </div>
                                                                                                                </body></html>`;
}

export async function sendConfirmationEmail({ to, firstName, tierId, orderNumber, qrUrl, transferUrl }) {
    const tier = TIERS[tierId] || { name: tierId };
    const html = ticketHtml({ firstName, tierId, orderNumber, qrUrl, transferUrl });
    const subject = `Your ${tier.name} ticket - CULTURE IN UNITY - Aug 9`;

  if (!process.env.RESEND_API_KEY) {
        console.log(`[email] RESEND_API_KEY not set - would send "${subject}" to ${to}`);
        return { skipped: true };
  }
    const resend = new Resend(process.env.RESEND_API_KEY);
    return resend.emails.send({
          from: process.env.EMAIL_FROM || "SOULPRINT COLLECTIVE <onboarding@resend.dev>",
          to,
          reply_to: process.env.EMAIL_REPLY_TO || undefined,
          subject,
          html,
    });
}
