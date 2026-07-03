import crypto from "crypto";

const SECRET = () => process.env.TICKET_SIGNING_SECRET || "dev-secret";

// Ticket token: <ticketId>.<hmac>
export function signTicket(ticketId) {
    const sig = crypto
      .createHmac("sha256", SECRET())
      .update(String(ticketId))
      .digest("base64url")
      .slice(0, 24);
    return ticketId + "." + sig;
}

export function verifyTicket(token) {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const idx = token.lastIndexOf(".");
    const ticketId = token.slice(0, idx);
    const expected = signTicket(ticketId);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return ticketId;
}

export function requireAdmin(request) {
    const pass = request.headers.get("x-admin-passcode");
    return !!pass && pass === process.env.ADMIN_PASSCODE;
}
