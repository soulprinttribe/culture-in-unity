import { Resend } from "resend";
import { EVENT, TIERS, ROLES } from "./config";

const SITE = "https://culture-in-unity.vercel.app";

const WHAT_TO_BRING = `
<li>Bring: your ID, an open heart, comfortable shoes to dance in, and cash/card for the marketplace and food vendors.</li>
<li>Leave at home: outside food &amp; drink, weapons of any kind, and bad vibes. Security will be present so everyone can feel safe and free.</li>`;

const TRANSIT = `
<li><strong>Subway:</strong> L train to Jefferson St - the venue is a short walk from the station.</li>
<li><strong>Bus:</strong> B57 / B38 stop nearby.</li>
<li><strong>Driving:</strong> street parking in Bushwick is limited - transit is the easeful path.</li>`;

// Shared branded header (sky + logo + title + rainbow bar)
function header() {
  return `<div style="background:#4f8fe8;background-image:url('${SITE}/sky.jpg');background-size:cover;background-position:center;border-radius:22px 22px 0 0;padding:28px 24px 26px;text-align:center;">
<img src="${SITE}/SOULPRINT%20LOGO_YELLOW_V2.png" alt="SOULPRINT" width="164" style="display:block;margin:0 auto 12px;filter:brightness(1.12) saturate(1.1);"/>
<p style="margin:0 0 8px;color:#ffffff;font-family:Impact,'Arial Narrow Bold',sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,0.35);">Conscious Creators Night Experience</p>
<p style="margin:0;color:#f5e11f;font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;font-size:46px;line-height:0.92;letter-spacing:1px;text-shadow:-2px -2px 0 #3a2fb0,2px -2px 0 #3a2fb0,-2px 2px 0 #3a2fb0,2px 2px 0 #3a2fb0,4px 5px 0 #241b6e;">CULTURE<br/>IN UNITY</p>
</div>
<div style="height:9px;background:linear-gradient(90deg,#e0403f,#ef8f3c,#f5d02a,#4fae5a,#37a2c9,#3f4fb0);"></div>`;
}

function ticketHtml({ firstName, tierId, orderNumber, qrUrl, transferUrl }) {
  const tier = TIERS[tierId] || { name: tierId, includesFood: false };
  const foodNote = tier.includesFood
    ? `<p style="background:#1a7f4e;color:#fff;padding:10px 16px;border-radius:10px;font-weight:bold;text-align:center;">Your ticket includes a cultural food plate - show your wristband at the food tables.</p>`
    : "";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#1a2a6b;font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
${header()}
<div style="background:#ffffff;border-radius:0 0 22px 22px;padding:28px 24px;">
<p style="font-size:18px;margin:0 0 6px;">Peace and blessings, ${firstName}</p>
<p style="margin:0 0 4px;">Your place inside the portal is confirmed. We can't wait to celebrate with you - many cultures, one soul.</p>
<div style="text-align:center;margin:24px 0;">
<img src="${qrUrl}" alt="Your ticket QR code" width="220" height="220" style="border:6px solid #f5e11f;border-radius:16px;background:#fff;"/>
<p style="margin:12px 0 0;font-weight:bold;font-size:16px;color:#3a2fb0;">${tier.name} - Order ${orderNumber}</p>
<p style="margin:4px 0 0;font-size:13px;color:#555;">Show this QR at the door. Screenshots are fine - each ticket scans once.</p>
</div>
${foodNote}
<h3 style="color:#3a2fb0;margin:22px 0 6px;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">THE ESSENTIALS</h3>
<ul style="padding-left:18px;line-height:1.6;margin:0;">
<li><strong>${EVENT.dateLabel}, ${EVENT.timeLabel}</strong></li>
<li><strong>${EVENT.venueName}</strong>, ${EVENT.venueAddress}</li>
</ul>
<h3 style="color:#3a2fb0;margin:22px 0 6px;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">WHAT TO BRING</h3>
<ul style="padding-left:18px;line-height:1.6;margin:0;">${WHAT_TO_BRING}</ul>
<h3 style="color:#3a2fb0;margin:22px 0 6px;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">GETTING THERE</h3>
<ul style="padding-left:18px;line-height:1.6;margin:0;">${TRANSIT}</ul>
<p style="margin-top:22px;">Can't make it? Your ticket is transferable (no refunds) - gift it to someone whose soul needs this:</p>
<p style="text-align:center;margin:16px 0 0;"><a href="${transferUrl}" style="background:#f5e11f;color:#3a2fb0;text-decoration:none;font-weight:bold;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;padding:14px 28px;border-radius:999px;display:inline-block;border:2px solid #3a2fb0;">TRANSFER / GIFT THIS TICKET</a></p>
<p style="margin-top:26px;">Follow the journey and join the community - this portal is only the beginning.</p>
<p style="font-weight:bold;margin:6px 0 0;">Peace and blessings,<br/>SOULPRINT COLLECTIVE</p>
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

// ============================================================
// Participant (artist / vendor) confirmation - role-colored QR pass
// ============================================================
function detailRows(role, details) {
  const d = details || {};
  const rows = [];
  if (role === "artist") {
    if (d.title) rows.push(["Title", d.title]);
    if (d.medium) rows.push(["Medium", d.medium]);
    if (d.format) rows.push(["Type", d.format]);
    if (d.dimensions) rows.push(["Size", d.dimensions]);
    if (d.forSale) rows.push(["For sale", d.price ? "Yes - " + d.price : "Yes"]);
    else if (d.forSale === false) rows.push(["For sale", "Not for sale"]);
  } else {
    if (d.boothNeeds) rows.push(["Booth needs", d.boothNeeds]);
    if (typeof d.power === "boolean") rows.push(["Power", d.power ? "Yes" : "No"]);
  }
  if (!rows.length) return "";
  return `<ul style="padding-left:18px;line-height:1.6;margin:0;">` +
    rows.map((r) => `<li><strong>${r[0]}:</strong> ${r[1]}</li>`).join("") + `</ul>`;
}

function submissionHtml({ firstName, role, refNumber, qrUrl, details }) {
  const r = ROLES[role] || { label: role, color: "#4b2fd0" };
  const rows = detailRows(role, details);
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#1a2a6b;font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
${header()}
<div style="background:#ffffff;border-radius:0 0 22px 22px;padding:28px 24px;">
<p style="font-size:18px;margin:0 0 6px;">Peace and blessings, ${firstName}</p>
<p style="margin:0 0 4px;">Your spot as a <strong style="color:${r.color};">${r.label}</strong> at CULTURE IN UNITY is confirmed. Thank you for bringing your gift to the circle - many cultures, one soul.</p>
<div style="text-align:center;margin:24px 0;">
<span style="display:inline-block;background:${r.color};color:#fff;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:2px;text-transform:uppercase;padding:6px 20px;border-radius:999px;font-size:16px;">${r.label} Pass</span>
<div style="margin-top:16px;"><img src="${qrUrl}" alt="Your ${r.label} QR pass" width="220" height="220" style="border:6px solid ${r.color};border-radius:16px;background:#fff;"/></div>
<p style="margin:12px 0 0;font-weight:bold;font-size:16px;color:#3a2fb0;">${r.label} Pass - Ref ${refNumber}</p>
<p style="margin:4px 0 0;font-size:13px;color:#555;">Show this QR at the door. Screenshots are fine - it scans once.</p>
</div>
<div style="background:#fdeceb;border:2px solid ${r.color};border-radius:12px;padding:14px 16px;margin:6px 0 4px;">
<p style="margin:0;font-weight:bold;color:#b02a26;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">ARRIVAL IS EVERYTHING</p>
<p style="margin:6px 0 0;font-size:14px;">Build-in begins at <strong>12:00 PM</strong>. You must be in the space and fully set up no later than <strong>1:00 PM</strong>. If you arrive after 1:00 PM you may forfeit your spot (no refund) so we can open the doors on time.</p>
</div>
${rows ? `<h3 style="color:#3a2fb0;margin:22px 0 6px;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">YOUR SUBMISSION</h3>${rows}` : ""}
<h3 style="color:#3a2fb0;margin:22px 0 6px;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">THE ESSENTIALS</h3>
<ul style="padding-left:18px;line-height:1.6;margin:0;">
<li><strong>${EVENT.dateLabel}, ${EVENT.timeLabel}</strong></li>
<li><strong>${EVENT.venueName}</strong>, ${EVENT.venueAddress}</li>
<li>Arrive 12:00 PM &middot; set up by 1:00 PM</li>
</ul>
<p style="margin-top:22px;">We'll be in touch with any final logistics. If anything about your submission changes, just reply to this email.</p>
<p style="font-weight:bold;margin:14px 0 0;">Peace and blessings,<br/>SOULPRINT COLLECTIVE</p>
</div>
</div>
</body></html>`;
}

export async function sendSubmissionEmail({ to, firstName, role, refNumber, qrUrl, details }) {
  const r = ROLES[role] || { label: role };
  const html = submissionHtml({ firstName, role, refNumber, qrUrl, details });
  const subject = `You're in - your CULTURE IN UNITY ${r.label} pass - Aug 9`;

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

// ============================================================
// Team notification - fires when someone pays + submits
// ============================================================
export async function sendTeamNotify({ role, name, email, socials, refNumber, description, details, imageUrls }) {
  const r = ROLES[role] || { label: role, color: "#4b2fd0" };
  const to = (process.env.TEAM_NOTIFY_EMAIL || "soulprinttribe@gmail.com")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const rows = detailRows(role, details);
  const imgs = (imageUrls || []).length
    ? `<p style="margin:12px 0 4px;font-weight:bold;">Images:</p>` +
      (imageUrls || []).map((u) => `<a href="${u}" style="color:#3a2fb0;">${u}</a>`).join("<br/>")
    : "<p style=\"margin:12px 0 4px;color:#777;\">No images uploaded.</p>";

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1c1c3a;max-width:600px;margin:0 auto;">
<div style="background:${r.color};color:#fff;padding:16px 20px;border-radius:12px 12px 0 0;">
<h2 style="margin:0;font-family:Impact,'Arial Narrow Bold',sans-serif;letter-spacing:1px;">New ${r.label} - paid &amp; submitted</h2>
</div>
<div style="border:2px solid ${r.color};border-top:none;border-radius:0 0 12px 12px;padding:18px 20px;">
<p style="margin:0 0 8px;"><strong>${name}</strong> just paid the ${r.feeLabel || ""} ${r.label.toLowerCase()} fee and submitted.</p>
<ul style="padding-left:18px;line-height:1.7;margin:0;">
<li><strong>Ref:</strong> ${refNumber}</li>
<li><strong>Email:</strong> ${email}</li>
${socials ? `<li><strong>Socials:</strong> ${socials}</li>` : ""}
</ul>
${description ? `<p style="margin:12px 0 4px;font-weight:bold;">Description:</p><p style="margin:0;">${description}</p>` : ""}
${rows ? `<p style="margin:12px 0 4px;font-weight:bold;">Details:</p>${rows}` : ""}
${imgs}
<p style="margin:16px 0 0;font-size:13px;color:#777;">Review everyone in the admin dashboard. If a submission is out of alignment, you can revoke it with a full refund from Stripe.</p>
</div>
</div>`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set - would notify team of new ${role}: ${name}`);
    return { skipped: true };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "SOULPRINT COLLECTIVE <onboarding@resend.dev>",
    to,
    reply_to: email || undefined,
    subject: `New ${r.label} paid + submitted - ${name}`,
    html,
  });
}
