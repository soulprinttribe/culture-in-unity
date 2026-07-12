"use client";

// Self-serve participant funnel (artist / vendor):
// details + images  ->  sign the on-site agreement  ->  Stripe checkout.
// No approval gate. Caps enforced server-side. Matches the site's sky world.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROLES } from "@/lib/config";
import { EVENT } from "@/lib/config";
import { CONTRACTS } from "@/lib/contracts";
import FlagBreak from "@/components/FlagBreak";

export default function SubmitForm({ role }) {
  const r = ROLES[role];
  const isArtist = role === "artist";

  const [avail, setAvail] = useState(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [socials, setSocials] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState("");
  const [format, setFormat] = useState("Physical");
  const [dimensions, setDimensions] = useState("");
  const [forSale, setForSale] = useState("no");
  const [price, setPrice] = useState("");

  const [boothNeeds, setBoothNeeds] = useState("");
  const [power, setPower] = useState("no");

  const [source, setSource] = useState("");
  const [agree, setAgree] = useState(false);
  const [sign, setSign] = useState("");

  useEffect(() => {
    fetch("/api/submit?role=" + role)
      .then((res) => res.json())
      .then(setAvail)
      .catch(() => {});
  }, [role]);

  function onFiles(e) {
    setImages(Array.from(e.target.files || []).slice(0, 5));
  }

  function validateDetails() {
    if (!name.trim()) return "Please enter your " + (isArtist ? "name" : "brand / name") + ".";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email - your pass is sent there.";
    if (isArtist && !title.trim()) return "Please give your work a title - it becomes your wall card.";
    if (!description.trim()) return isArtist ? "Please describe your work." : "Please tell us what you sell.";
    if (images.length < 1) return "Please upload at least one image.";
    return "";
  }

  function goContract(e) {
    e.preventDefault();
    const v = validateDetails();
    if (v) return setError(v);
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function pay(e) {
    e.preventDefault();
    if (!agree) return setError("Please check the box to agree to the participation agreement.");
    if (sign.trim().length < 2) return setError("Please type your full name to sign.");
    setError("");
    setBusy(true);
    try {
      const details = isArtist
        ? {
            title: title.trim(),
            medium: medium.trim(),
            format,
            dimensions: dimensions.trim(),
            forSale: forSale === "yes",
            price: forSale === "yes" ? price.trim() : "",
          }
        : { boothNeeds: boothNeeds.trim(), power: power === "yes" };

      const fd = new FormData();
      fd.append("role", role);
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("socials", socials.trim());
      fd.append("description", description.trim());
      fd.append("details", JSON.stringify(details));
      fd.append("contractName", sign.trim());
      fd.append("source", source);
      images.forEach((f) => fd.append("images", f));

      const res = await fetch("/api/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const soldOut = avail && avail.remaining <= 0;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
      <p className="center"><Link href="/" className="muted">back to the portal</Link></p>
      <h1 className="center" style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)", fontFamily: "var(--font-label), Impact, 'Arial Narrow Bold', sans-serif" }}>
        {isArtist ? "Show Your Art" : "Become a Vendor"}
      </h1>
      <p className="center mt-1">
        {isArtist
          ? "Exhibit and sell your original work at CULTURE IN UNITY."
          : "Bring your goods to the marketplace at CULTURE IN UNITY."}
        <br />
        <strong>{r.feeLabel}</strong> &middot; {EVENT.dateLabel} &middot; {EVENT.venueName}
      </p>
      {avail && !soldOut && (
        <p className="center muted mt-1">{avail.remaining} of {avail.cap} spots left</p>
      )}
      <FlagBreak canvasStyle={{ height: 64 }} />

      {soldOut ? (
        <div className="card center mt-3">
          <h3>Spots are full</h3>
          <p className="mt-2">All {r.label.toLowerCase()} spots for this event have been claimed. Thank you for the love - reply to any of our emails to join the waitlist.</p>
        </div>
      ) : step === 1 ? (
        <form onSubmit={goContract}>
          <label htmlFor="name">{isArtist ? "Your name" : "Brand / name"}</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={isArtist ? "Full name" : "Your brand or name"} />

          <label htmlFor="email">Email (your pass lands here)</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

          <label htmlFor="socials">Social handle(s)</label>
          <input id="socials" value={socials} onChange={(e) => setSocials(e.target.value)} placeholder="@yourhandle (IG, etc.)" />

          <label htmlFor="source">How did you hear about us?</label>
          <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Select one (optional)</option>
            <option>Flyer / QR code</option>
            <option>Instagram</option>
            <option>Social media (stories, posts)</option>
            <option>Word of mouth</option>
            <option>Other</option>
          </select>

          {isArtist ? (
            <>
              <label htmlFor="title">Title of your work</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Shown on your wall card" />

              <label htmlFor="medium">Medium</label>
              <input id="medium" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Acrylic, photography, digital print..." />

              <label htmlFor="format">Physical or digital?</label>
              <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option>Physical</option>
                <option>Digital</option>
              </select>

              <label htmlFor="dimensions">Size / dimensions</label>
              <input id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder='e.g. 24" x 36", or screen size' />

              <label htmlFor="description">Tell us about your work</label>
              <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="This + your title become the card beside your piece." />

              <label htmlFor="forSale">Is it for sale?</label>
              <select id="forSale" value={forSale} onChange={(e) => setForSale(e.target.value)}>
                <option value="no">Not for sale</option>
                <option value="yes">Yes, for sale</option>
              </select>
              {forSale === "yes" && (
                <>
                  <label htmlFor="price">Price</label>
                  <input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $150 (you keep 100%)" />
                </>
              )}
            </>
          ) : (
            <>
              <label htmlFor="description">What do you sell?</label>
              <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your products / offerings." />

              <label htmlFor="boothNeeds">Booth needs</label>
              <textarea id="boothNeeds" rows={2} value={boothNeeds} onChange={(e) => setBoothNeeds(e.target.value)} placeholder="Table size, space, anything we should know." />

              <label htmlFor="power">Do you need power / an outlet?</label>
              <select id="power" value={power} onChange={(e) => setPower(e.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </>
          )}

          <label htmlFor="images">Upload images {isArtist ? "of your work" : "of your products"} (1-5)</label>
          <input id="images" type="file" accept="image/*" multiple onChange={onFiles} style={{ padding: 10, background: "#fff" }} />
          {images.length > 0 && <p className="muted mt-1">{images.length} image{images.length > 1 ? "s" : ""} selected</p>}

          {error && (
            <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" className="btn mt-3" style={{ width: "100%", fontSize: "1.15rem" }}>Review &amp; sign the agreement</button>
        </form>
      ) : (
        <form onSubmit={pay}>
          <div className="card solid" style={{ maxHeight: 340, overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: CONTRACTS[role] }} />

          <label htmlFor="sign" className="mt-3">Type your full name to sign</label>
          <input id="sign" value={sign} onChange={(e) => setSign(e.target.value)} placeholder="Your full legal name" />

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, fontWeight: 400 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2 }} />
            <span>I have read and agree to the {r.label} Participation Agreement, including arriving for 12 PM build-in and being set up by 1 PM.</span>
          </label>

          {error && (
            <p className="mt-2" style={{ background: "var(--ribbon-red)", padding: "10px 14px", borderRadius: 12, fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" className="btn glow mt-3" style={{ width: "100%", fontSize: "1.2rem" }} disabled={busy}>
            {busy ? "Opening secure checkout..." : "Agree & pay " + r.feeLabel}
          </button>
          <p className="center mt-2">
            <button type="button" className="muted" onClick={() => { setStep(1); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", color: "inherit" }}>
              back to edit my details
            </button>
          </p>
          <p className="muted center mt-1">
            Secure checkout by Stripe. Your {r.feeLabel} fee is non-refundable, except if SOULPRINT revokes your spot for misalignment (full refund).
          </p>
        </form>
      )}
    </main>
  );
}
