"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStudio } from "./studio-context";
import { RECONSTRUCTION_STEPS } from "@/lib/easyvariants/config";

/** Garment-shaped target point cloud in normalized [-1, 1] space. */
function buildTargets(count = 120): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x: number;
    let y: number;
    if (r < 0.62) {
      // torso
      x = (Math.random() - 0.5) * 0.9;
      y = (Math.random() - 0.5) * 1.3 + 0.05;
    } else if (r < 0.81) {
      // left sleeve
      x = -0.45 - Math.random() * 0.5;
      y = 0.35 - Math.random() * 0.9;
    } else {
      // right sleeve
      x = 0.45 + Math.random() * 0.5;
      y = 0.35 - Math.random() * 0.9;
    }
    pts.push({ x, y });
  }
  return pts;
}

export function ReconstructionOverlay() {
  const { status, progress, stepIndex } = useStudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (status !== "generating") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const targets = buildTargets(120);
    const particles = targets.map((t) => ({
      sx: (Math.random() - 0.5) * 3,
      sy: (Math.random() - 0.5) * 3,
      tx: t.x,
      ty: t.y,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.34;

      const p = progressRef.current / 100;
      const ease = 1 - Math.pow(1 - p, 3);

      const positions = particles.map((pt) => ({
        x: cx + (pt.sx + (pt.tx - pt.sx) * ease) * scale,
        y: cy + (pt.sy + (pt.ty - pt.sy) * ease) * scale,
      }));

      // mesh lines
      ctx.strokeStyle = `rgba(51,102,255,${0.06 + ease * 0.22})`;
      ctx.lineWidth = dpr;
      const linkDist = scale * 0.42;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const pos of positions) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(10,10,11,${0.35 + ease * 0.5})`;
        ctx.arc(pos.x, pos.y, dpr * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status]);

  return (
    <AnimatePresence>
      {status === "generating" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[3px]"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <div className="relative flex flex-col items-center">
            <div className="relative grid h-24 w-24 place-items-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="#e4e4e7" strokeWidth="5" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="#0a0a0b"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>
              <span className="absolute font-mono text-lg font-semibold tabular-nums text-ink">
                {Math.round(progress)}
                <span className="text-xs text-ink-faint">%</span>
              </span>
            </div>

            <div className="mt-5 h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-medium text-ink"
                >
                  {RECONSTRUCTION_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="mt-1 text-[12px] text-ink-faint">
              Cinematic reconstruction · particles → mesh → material
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
