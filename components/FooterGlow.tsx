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

    let w = 0,
      h = 0,
      raf = 0,
      running = true;

    // --- Resolution Management ---
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = w;
      canvas.height = h;
    };

    // --- Thick Wave System Array ---
    const waves = [
      {
        baseHeightMultiplier: 0.55,
        amplitude: 28,
        frequency: 0.004,
        speed: 0.0012,
        thickness: 45,
        color: "rgba(108, 40, 205, 0.75)", // Deep Purple
      },
      {
        baseHeightMultiplier: 0.45,
        amplitude: 34,
        frequency: 0.003,
        speed: -0.0009, // Moves opposite direction
        thickness: 55,
        color: "rgba(130, 60, 240, 0.5)", // Medium Purple
      },
      {
        baseHeightMultiplier: 0.65,
        amplitude: 22,
        frequency: 0.006,
        speed: 0.0018,
        thickness: 35,
        color: "rgba(255, 100, 150, 0.35)", // Accent Glow
      },
    ];

    // --- Core Animation Loop ---
    const draw = (time: number) => {
      if (!running) return;

      ctx.clearRect(0, 0, w, h);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.lineWidth = wave.thickness;
        ctx.strokeStyle = wave.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const t = reduced ? 0 : time * wave.speed;
        const baseY = h * wave.baseHeightMultiplier;

        for (let x = 0; x <= w; x += 4) {
          const wave1 = Math.sin(x * wave.frequency + t);
          const wave2 = Math.cos(x * (wave.frequency * 0.5) - t * 0.7);
          const y = baseY + (wave1 + wave2) * wave.amplitude;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    // --- Intersection Observer Optimization ---
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
      className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full overflow-hidden select-none"
    >
      {/* Static Background Radial Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background:
            "radial-gradient(ellipse 70% 130% at 50% 100%, rgba(109,40,217,0.18) 0%, rgba(59,130,246,0.05) 55%, transparent 78%)",
          filter: "blur(40px)",
        }}
      />
      {/* FIXED: Removed opacity-0 utility class completely */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "blur(14px)", mixBlendMode: "screen" }}
      />
    </div>
  );
}
