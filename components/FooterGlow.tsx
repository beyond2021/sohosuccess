"use client";

import { useEffect, useRef } from "react";

export default function FooterGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // --- Noise & FBM Setup ---
    const P = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    let seed = 1337;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      const tmp = perm[i];
      perm[i] = perm[j];
      perm[j] = tmp;
    }
    for (let i = 0; i < 512; i++) P[i] = perm[i & 255];

    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const grad = (hash: number, x: number, y: number, z: number) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const noise = (x: number, y: number, z: number) => {
      const X = Math.floor(x) & 255,
        Y = Math.floor(y) & 255,
        Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      const u = fade(x),
        v = fade(y),
        wf = fade(z);
      const A = P[X] + Y,
        AA = P[A] + Z,
        AB = P[A + 1] + Z;
      const B = P[X + 1] + Y,
        BA = P[B] + Z,
        BB = P[B + 1] + Z;
      return lerp(
        lerp(
          lerp(grad(P[AA], x, y, z), grad(P[BA], x - 1, y, z), u),
          lerp(grad(P[AB], x, y - 1, z), grad(P[BB], x - 1, y - 1, z), u),
          v,
        ),
        lerp(
          lerp(
            grad(P[AA + 1], x, y, z - 1),
            grad(P[BA + 1], x - 1, y, z - 1),
            u,
          ),
          lerp(
            grad(P[AB + 1], x, y - 1, z - 1),
            grad(P[BB + 1], x - 1, y - 1, z - 1),
            u,
          ),
          v,
        ),
        wf,
      );
    };

    const fbm = (x: number, y: number, z: number) => {
      let v = 0,
        a = 0.5,
        f = 1;
      for (let i = 0; i < 4; i++) {
        v += a * noise(x * f, y * f, z * f);
        f *= 2.03;
        a *= 0.5;
      }
      return v;
    };

    // --- Resolution Management ---
    const FW = 128;
    let FH = 52;
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d", { willReadFrequently: true });
    if (!bctx) return;

    let img: ImageData;
    let w = 0,
      h = 0,
      raf = 0,
      running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = w;
      canvas.height = h;
      FH = Math.max(24, Math.round(FW * (h / w)));
      buf.width = FW;
      buf.height = FH;
      img = bctx.createImageData(FW, FH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    // --- Core Animation Loop ---
    const draw = (time: number) => {
      if (!running) return;

      const t = reduced ? 0 : time * 0.0001;
      const d = img.data;

      for (let y = 0; y < FH; y++) {
        const v = y / FH;
        const rise = Math.pow(v, 2.4);
        for (let x = 0; x < FW; x++) {
          const u = x / FW;

          const qx = fbm(u * 2.1, v * 1.6 - t * 3.2, t * 1.7);
          const qy = fbm(u * 2.1 + 4.7, v * 1.6 - t * 2.6 + 2.3, t * 1.4);

          let n = fbm(
            u * 2.6 + qx * 1.15,
            v * 2.0 + qy * 1.15 - t * 4.0,
            t * 2.2 + 9.1,
          );
          n = n * 0.5 + 0.5;

          const sides = Math.pow(
            Math.sin(Math.min(1, Math.max(0, u)) * Math.PI),
            0.7,
          );
          let dens = (n * 1.35 - 0.28) * rise * sides;
          if (dens <= 0.002) {
            const i0 = (y * FW + x) * 4;
            d[i0] = d[i0 + 1] = d[i0 + 2] = d[i0 + 3] = 0;
            continue;
          }
          dens = Math.min(1, dens);

          const hot = Math.pow(dens, 2.6);
          const r = 108 + hot * 147 + dens * 40;
          const g = 40 + hot * 165 + dens * 22;
          const b = 205 + hot * 50 + dens * 20;
          const a = Math.min(255, dens * 300);

          const i = (y * FW + x) * 4;
          d[i] = Math.min(255, r);
          d[i + 1] = Math.min(255, g);
          d[i + 2] = Math.min(255, b);
          d[i + 3] = a;
        }
      }

      bctx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(buf, 0, 0, w, h);

      // CRITICAL FIX: Loop requires passing the draw function so requestAnimationFrame feeds new timestamps
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    // --- Optimization: Run Only When Visible ---
    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        if (running) {
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[190px] overflow-hidden select-none"
    >
      {/* Static Background Radial Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out animate-fade-in"
        style={{
          background:
            "radial-gradient(ellipse 70% 130% at 50% 100%, rgba(109,40,217,0.18) 0%, rgba(59,130,246,0.05) 55%, transparent 78%)",
          filter: "blur(40px)",
        }}
      />
      {/* Animated Noise Fluid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000 ease-in-out [animation-fill-mode:forwards] [animation-delay:200ms] animate-fade-in"
        style={{ filter: "blur(12px)", mixBlendMode: "screen" }}
      />
    </div>
  );
}
