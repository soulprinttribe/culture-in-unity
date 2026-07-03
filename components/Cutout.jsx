"use client";

// Removes a white BACKGROUND only (flood fill from the image edges),
// preserving white details inside the artwork (clouds, contrails).

import { useEffect, useRef } from "react";

export default function Cutout({ src, alt, style = {}, threshold = 238 }) {
  const ref = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = ref.current;
      if (!c) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, w, h);
      const p = d.data;
      const visited = new Uint8Array(w * h);
      const stack = [];
      const isBg = (i) => Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]) > threshold;

      for (let x = 0; x < w; x++) { stack.push(x); stack.push((h - 1) * w + x); }
      for (let y = 0; y < h; y++) { stack.push(y * w); stack.push(y * w + w - 1); }

      while (stack.length) {
        const i = stack.pop();
        if (i < 0 || i >= w * h || visited[i] || !isBg(i)) continue;
        visited[i] = 1;
        p[i * 4 + 3] = 0;
        const x = i % w;
        if (x > 0) stack.push(i - 1);
        if (x < w - 1) stack.push(i + 1);
        stack.push(i - w);
        stack.push(i + w);
      }

      // soften the 1px halo around the cutout
      for (let i = 0; i < w * h; i++) {
        if (visited[i]) continue;
        const x = i % w;
        const nearBg =
          (x > 0 && visited[i - 1]) || (x < w - 1 && visited[i + 1]) ||
          (i >= w && visited[i - w]) || (i < w * (h - 1) && visited[i + w]);
        if (nearBg) p[i * 4 + 3] = Math.min(p[i * 4 + 3], 140);
      }

      ctx.putImageData(d, 0, 0);
    };
  }, [src, threshold]);

  return <canvas ref={ref} role="img" aria-label={alt} style={{ height: "auto", ...style }} />;
}
