"use client";

// The globe-head - Phase 1 hero 3D asset (brief section 20).
// Three.js textured Earth that floats and reacts to the cursor.
// Degrades to a 2D gradient globe on low-end devices / reduced motion.

import { useEffect, useRef, useState } from "react";

const EARTH_TEXTURE = "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";

export default function Globe({ size = 260 }) {
  const mountRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setFallback(true); return; }

    let renderer, frameId, disposed = false;
    const mouse = { x: 0, y: 0 };

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed || !mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 3;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const geo = new THREE.SphereGeometry(1, 48, 48);
        const tex = new THREE.TextureLoader().load(EARTH_TEXTURE);
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: tex });
        const earth = new THREE.Mesh(geo, mat);
        earth.rotation.y = Math.PI * 1.6; // start on the Americas day side
        scene.add(earth);

        const glowGeo = new THREE.SphereGeometry(1.12, 48, 48);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xf5e829, transparent: true, opacity: 0.14, side: THREE.BackSide,
        });
        scene.add(new THREE.Mesh(glowGeo, glowMat));

        const onMove = (e) => {
          mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
          mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("pointermove", onMove);

        const clock = new THREE.Clock();
        const animate = () => {
          const t = clock.getElapsedTime();
          earth.rotation.y += 0.0022;
          earth.rotation.x += (mouse.y * 0.25 - earth.rotation.x) * 0.04;
          earth.rotation.y += mouse.x * 0.003;
          earth.position.y = Math.sin(t * 0.9) * 0.06;
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        animate();

        const cleanup = () => {
          window.removeEventListener("pointermove", onMove);
          cancelAnimationFrame(frameId);
          if (renderer) renderer.dispose();
        };
        mountRef.current._cleanup = cleanup;
      } catch (e) {
        console.warn("[globe] WebGL unavailable, using 2D fallback");
        setFallback(true);
      }
    })();

    return () => {
      disposed = true;
      if (mountRef.current && mountRef.current._cleanup) mountRef.current._cleanup();
    };
  }, [size]);

  if (fallback) {
    return (
      <div
        aria-hidden
        style={{
          width: size, height: size, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #6fbf73 0 18%, #2a6fbb 22% 55%, #1c4f8f 100%)",
          boxShadow: "0 0 60px rgba(245,232,41,0.45), inset -18px -14px 40px rgba(0,0,0,0.35)",
        }}
      />
    );
  }

  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden />;
}
