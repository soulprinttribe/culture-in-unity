"use client";

// Renders flyer art with its white background keyed out at runtime,
// auto-cropped to the artwork's bounding box. Lets us use the exact
// bubble-lettering title from the flyer without a pre-cut PNG.

import { useEffect, useRef } from "react";

export default function TitleArt({ src, alt, maxWidth = 680, threshold = 232 }) {
  const ref = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = ref.current;
      if (!c) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      const work = document.createElement("canvas");
      work.width = w; work.height = h;
      const wctx = work.getContext("2d");
      wctx.drawImage(img, 0, 0);
      const d = wctx.getImageData(0, 0, w, h);
      const p = d.data;
      let minX = w, minY = h, maxX = 0, maxY = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const m = Math.min(p[i], p[i + 1], p[i + 2]);
          if (m > threshold) {
            p[i + 3] = 0;
          } else {
            if (m > threshold - 24) p[i + 3] = Math.round(255 * (threshold - m) / 24);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      wctx.putImageData(d, 0, 0);
      const pad = 8;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
      const cw = maxX - minX + 1, ch = maxY - minY + 1;
      c.width = cw; c.height = ch;
      c.getContext("2d").drawImage(work, minX, minY, cw, ch, 0, 0, cw, ch);
    };
  }, [src, threshold]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={alt}
      style={{ width: "100%", maxWidth, height: "auto", filter: "drop-shadow(0 6px 12px rgba(26,26,80,0.35))" }}
    />
  );
}
