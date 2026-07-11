import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// Renders the QR as a PNG. Ticket QR = indigo. Role QR = role color
// (artist red / vendor teal) so the door + email read at a glance.
export async function GET(request, { params }) {
  const token = decodeURIComponent(params.token || "");
  let dark = "#4b2fd0";
  if (token.startsWith("art_")) dark = "#e0403f";
  else if (token.startsWith("ven_")) dark = "#2ab7ca";
  const png = await QRCode.toBuffer(token, {
    type: "png",
    width: 440,
    margin: 2,
    color: { dark, light: "#ffffff" },
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
