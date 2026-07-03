"use client";

// Flag garland page-break (flyer motif: flags of many cultures draped
// across the screen). Auto-crops the PNG's transparent padding.

import { useEffect, useRef } from "react";

export default function FlagBreak() {
  const ref = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/flag.png";
    img.onload = () => {
      const c = ref.current;
      if (!c) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      const work = document.createElement("canvas");
      work.width = w; work.height = h;
      const wctx = work.getContext("2d");
      wctx.drawImage(img, 0, 0);
      const p = wctx.getImageData(0, 0, w, h).data;
      let minX = w, minY = h, maxX = 0, maxY = 0;
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          if (p[(y * w + x) * 4 + 3] > 12) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      const cw = maxX - minX + 1, ch = maxY - minY + 1;
      if (cw <= 0 || ch <= 0) return;
      c.width = cw; c.height = ch;
      c.getContext("2d").drawImage(work, minX, minY, cw, ch, 0, 0, cw, ch);
    };
  }, []);

  return (
    <div aria-hidden style={{ width: "100%", maxWidth: 760, margin: "20px auto", overflow: "hidden" }}>
      <canvas
        ref={ref}
        style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 8px 14px rgba(26,26,80,0.35))" }}
      />
    </div>
  );
}
