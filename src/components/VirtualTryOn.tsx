"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { TryOnScene } from "@/components/tryon/TryOnScenes";
import { TRYON_STEPS } from "@/lib/data";
import { easeOutExpo, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/cn";
import {
  IconUpload,
  IconUser,
  IconSparkles,
  IconReset,
  IconShield,
} from "@/components/ui/icons";

type Status = "idle" | "loading" | "result";

// Approximate skeleton points for the "pose detection" overlay (%).
const POSE_POINTS = [
  { x: 50, y: 21 }, // head
  { x: 50, y: 33 }, // neck
  { x: 34, y: 38 }, // l shoulder
  { x: 66, y: 38 }, // r shoulder
  { x: 30, y: 56 }, // l elbow
  { x: 70, y: 56 }, // r elbow
  { x: 50, y: 55 }, // chest
  { x: 44, y: 74 }, // l hip
  { x: 56, y: 74 }, // r hip
  { x: 44, y: 90 }, // l knee
  { x: 56, y: 90 }, // r knee
];
const POSE_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [1, 6],
  [6, 7],
  [6, 8],
  [7, 9],
  [8, 10],
];

export function VirtualTryOn() {
  const [status, setStatus] = useState<Status>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const runLoading = useCallback(() => {
    setStatus("loading");
    setStepIndex(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= TRYON_STEPS.length) {
        window.clearInterval(id);
        window.setTimeout(() => setStatus("result"), 600);
      } else {
        setStepIndex(i);
      }
    }, 1000);
  }, []);

  const onFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(URL.createObjectURL(file));
      runLoading();
    },
    [photoUrl, runLoading],
  );

  const useSample = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    runLoading();
  }, [photoUrl, runLoading]);

  const reset = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setStatus("idle");
    setStepIndex(0);
  }, [photoUrl]);

  return (
    <section id="try-on" className="relative py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Experience"
          title="AI Virtual Try-On"
          description="Experience how products can be visualized in real-world environments using AI-assisted virtual try-on technology. This is a frontend demo of the end-user experience."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-[1fr_1fr]"
        >
          {/* Left: stage */}
          <div className="relative overflow-hidden rounded-4xl border border-line bg-surface-subtle p-3 shadow-card sm:p-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white">
              <AnimatePresence mode="wait">
                {status === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
                  >
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-ink text-white shadow-soft">
                      <IconUser className="h-8 w-8" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-ink">
                      Upload a photo to preview
                    </h3>
                    <p className="mt-1.5 max-w-xs text-sm text-ink-muted">
                      See how the experience feels — your photo stays in your
                      browser and is never uploaded.
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <Button
                        onClick={() => inputRef.current?.click()}
                        leftIcon={<IconUpload className="h-5 w-5" />}
                      >
                        Upload Your Photo
                      </Button>
                      <button
                        type="button"
                        onClick={useSample}
                        className="text-sm font-medium text-brand-600 underline-offset-4 transition hover:underline"
                      >
                        Use a sample instead
                      </button>
                    </div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && onFile(e.target.files[0])
                      }
                    />
                  </motion.div>
                )}

                {status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <LoadingStage
                      photoUrl={photoUrl}
                      stepIndex={stepIndex}
                    />
                  </motion.div>
                )}

                {status === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: easeOutExpo }}
                    className="absolute inset-0"
                  >
                    <BeforeAfterSlider
                      className="h-full w-full rounded-none border-0"
                      before={<TryOnScene styled={false} />}
                      after={<TryOnScene styled />}
                      beforeLabel="Original"
                      afterLabel="Try-On"
                    />
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white shadow-glow">
                      Demo Preview
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: copy + controls */}
          <div className="flex flex-col justify-center gap-6 rounded-4xl border border-line bg-white p-6 shadow-soft sm:p-8">
            <div>
              <span className="eyebrow">
                <IconSparkles className="h-3.5 w-3.5 text-brand-500" />
                Virtual Try-On
              </span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                See the product on, before you buy
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                A realistic preview of the try-on flow: image analysis, pose
                detection, product placement, and a side-by-side result you can
                scrub through.
              </p>
            </div>

            <ol className="space-y-2.5">
              {TRYON_STEPS.map((step, i) => (
                <li
                  key={step}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
                    status === "loading" && i === stepIndex
                      ? "border-ink bg-ink text-white"
                      : status === "result" || (status === "loading" && i < stepIndex)
                        ? "border-line bg-surface-subtle text-ink"
                        : "border-line bg-white text-ink-muted",
                  )}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            {status === "result" && (
              <Button
                variant="secondary"
                onClick={reset}
                leftIcon={<IconReset className="h-4 w-4" />}
              >
                Try another photo
              </Button>
            )}

            <div className="flex items-start gap-2.5 rounded-2xl bg-surface-subtle p-4">
              <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
              <p className="text-[12px] leading-relaxed text-ink-muted">
                This demonstration showcases the user experience only. Backend
                AI processing is not included.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LoadingStage({
  photoUrl,
  stepIndex,
}: {
  photoUrl: string | null;
  stepIndex: number;
}) {
  return (
    <div className="relative h-full w-full">
      {/* Base image or placeholder figure */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt="Uploaded"
          className="h-full w-full object-cover"
        />
      ) : (
        <TryOnScene styled={false} />
      )}

      {/* subtle darkening */}
      <div className="absolute inset-0 bg-ink/5" />

      {/* scanning line */}
      <motion.div
        initial={{ top: "0%" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 h-16 bg-gradient-to-b from-brand-500/0 via-brand-500/25 to-brand-500/0"
      />

      {/* pose skeleton overlay */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {POSE_LINKS.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={POSE_POINTS[a].x}
            y1={POSE_POINTS[a].y}
            x2={POSE_POINTS[b].x}
            y2={POSE_POINTS[b].y}
            stroke="#3366ff"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {POSE_POINTS.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.9"
            fill="#ffffff"
            stroke="#3366ff"
            strokeWidth="0.4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* status pill */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-5">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 shadow-card backdrop-blur"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" />
          <span className="text-sm font-medium text-ink">
            {TRYON_STEPS[stepIndex]}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
