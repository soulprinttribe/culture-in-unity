import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// Renders the ticket QR as a PNG (referenced from the confirmation email)
export async function GET(request, { params }) {
  const token = decodeURIComponent(params.token || "");
  const png = await QRCode.toBuffer(token, {
    type: "png",
    width: 440,
    margin: 2,
    color: { dark: "#4b2fd0", light: "#ffffff" },
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
