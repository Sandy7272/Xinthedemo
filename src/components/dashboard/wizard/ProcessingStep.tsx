"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Cpu, Clock, Image as ImageIcon } from "lucide-react";
import { useWizard } from "./wizard-context";
import { useStudio } from "../studio-context";
import { RECONSTRUCTION_STEPS } from "@/lib/easyvariants/config";

/** The source image with an animated scanning sweep + wireframe grid. */
function ScanPreview({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface-subtle">
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Source"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#eef4ff_0%,#ffffff_74%)]">
          <ImageIcon className="h-10 w-10 text-brand-300" />
        </span>
      )}

      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
        style={{
          backgroundImage:
            "linear-gradient(rgba(51,102,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(51,102,255,0.16) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <motion.div
        aria-hidden
        initial={{ y: "-20%" }}
        animate={{ y: "120%" }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-x-0 h-1/4"
        style={{
          background:
            "linear-gradient(to bottom, rgba(51,102,255,0) 0%, rgba(51,102,255,0.25) 60%, rgba(51,102,255,0.9) 100%)",
          boxShadow: "0 0 24px 4px rgba(51,102,255,0.5)",
        }}
      />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-soft backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
        Scanning
      </span>
    </div>
  );
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ProcessingStep() {
  const { source } = useWizard();
  const { generate, progress, stepIndex, status } = useStudio();
  const [elapsed, setElapsed] = useState(0);

  // Kick off the (mock) reconstruction once, when this screen mounts.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "generating") return;
    const t0 = performance.now();
    const id = window.setInterval(
      () => setElapsed((performance.now() - t0) / 1000),
      100,
    );
    return () => window.clearInterval(id);
  }, [status]);

  const pct = Math.round(progress);
  const done = status === "ready";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-subtle px-3 py-1.5 text-[12px] font-medium text-ink-muted"
        >
          <Cpu className="h-3.5 w-3.5 text-brand-500" />
          Image-to-3D Reconstruction
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          Building your 3D model
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid items-stretch gap-6 rounded-3xl border border-line bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
      >
        <ScanPreview src={source} />

        <div className="flex min-w-0 flex-col">
          {/* progress bar */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint">
                {done ? "Complete" : "Processing"}
              </p>
              <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-ink">
                {pct}
                <span className="text-base text-ink-faint">%</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <Clock className="h-3.5 w-3.5 text-ink-faint" />
                Elapsed {fmt(elapsed)}
              </span>
              <span className="text-ink-faint">Est. 1m 42s on GPU</span>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
            <motion.div
              className="relative h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            >
              <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </motion.div>
          </div>

          {/* pipeline checklist */}
          <ul className="mt-5 grid flex-1 content-start gap-1.5 sm:grid-cols-2">
            {RECONSTRUCTION_STEPS.map((label, i) => {
              const complete = i < stepIndex || done;
              const active = i === stepIndex && !done;
              return (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px]"
                >
                  <span
                    className={
                      complete
                        ? "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#12b76a]/12 text-[#0f9457]"
                        : active
                          ? "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500"
                          : "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-faint"
                    }
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {complete ? (
                        <motion.span
                          key="c"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      ) : active ? (
                        <Loader2 key="a" className="h-3 w-3 animate-spin" />
                      ) : (
                        <span key="p" className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </AnimatePresence>
                  </span>
                  <span
                    className={
                      complete
                        ? "text-ink"
                        : active
                          ? "font-medium text-ink"
                          : "text-ink-faint"
                    }
                  >
                    {label}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
