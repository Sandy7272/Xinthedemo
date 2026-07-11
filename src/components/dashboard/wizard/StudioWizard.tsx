"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Palette,
  Shirt,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";
import { useWizard } from "./wizard-context";
import { WIZARD_STEPS } from "./steps";
import { GalleryStep } from "./GalleryStep";
import { ProcessingStep } from "./ProcessingStep";
import { LightingRail } from "./LightingRail";
import { TechShowcase } from "./TechShowcase";
import { VariantPanel } from "../VariantPanel";
import { VirtualTryOnPanel } from "../VirtualTryOnPanel";
import { useStudio } from "../studio-context";
import { APPLICANT, BRAND } from "@/lib/easyvariants/config";
import { cn } from "@/lib/cn";

const ProductViewer = dynamic(() => import("../viewer/ProductViewer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[280px] place-items-center rounded-2xl border border-line bg-surface-subtle">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
        <span className="text-sm text-ink-muted">Initializing 3D viewer…</span>
      </div>
    </div>
  ),
});

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
};

/** Compact one-line heading used at the top of a step. */
function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 shrink-0">
      <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
        {title}
      </h2>
      <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>
    </div>
  );
}

/** Centers a step's content vertically on desktop; flows naturally on mobile. */
function CenterStep({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col py-2 lg:min-h-full lg:justify-center lg:py-1">
      {children}
    </div>
  );
}

export function StudioWizard() {
  const { step } = useWizard();

  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle lg:h-screen lg:overflow-hidden">
      <TopBar />
      <Stepper />

      <main className="relative min-h-0 flex-1 lg:overflow-hidden">
        {/* Ambient background — subtle dot grid + brand glow for depth. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-dot-grid opacity-50" />
          <div className="absolute left-1/2 top-[-190px] h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-brand-100/40 blur-[110px]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-5 lg:h-full lg:px-8">
          <div className="relative flex-1 lg:min-h-0 lg:overflow-y-auto lg:no-scrollbar">
            {step === 2 || step === 3 ? (
              <ViewerBlock step={step} />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {step === 0 && (
                  <motion.div key="gallery" className="lg:min-h-full" {...fade}>
                    <CenterStep>
                      <GalleryStep />
                    </CenterStep>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="processing" className="lg:min-h-full" {...fade}>
                    <CenterStep>
                      <ProcessingStep />
                    </CenterStep>
                  </motion.div>
                )}
                {step === 4 && (
                  <motion.div
                    key="tryon"
                    className="mx-auto w-full max-w-6xl space-y-6 py-2"
                    {...fade}
                  >
                    <VirtualTryOnPanel />
                    <TechShowcase />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
}

/** The 3D viewer + side rail, shared (kept mounted) across Model and Variants. */
function ViewerBlock({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:h-full"
    >
      <StepHeading
        title={step === 2 ? "Your 3D model" : "Customize variants"}
        subtitle={
          step === 2
            ? "Drag to rotate · scroll to zoom · shape the lighting on the right."
            : "Swap colour, fabric and logo — the model updates instantly."
        }
      />
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[52vh] min-h-[320px] lg:h-auto lg:min-h-0">
          <ProductViewer />
        </div>
        <div className="no-scrollbar lg:min-h-0 lg:overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {step === 2 ? (
              <motion.div key="rail-lighting" className="lg:h-full" {...fade}>
                <LightingRail />
              </motion.div>
            ) : (
              <motion.div key="rail-variants" {...fade}>
                <VariantPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function TopBar() {
  const { restart, step } = useWizard();
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-line bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-[13px] font-bold text-white">
          EV
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight text-ink">
            {BRAND.name}
          </p>
          <p className="text-[10px] font-medium text-ink-faint">{BRAND.product}</p>
        </div>

        <span className="ml-3 hidden items-center gap-1.5 rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-ink-muted sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
          Interactive demo
        </span>

        <div className="ml-auto flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-soft shadow-soft transition-colors hover:bg-surface-subtle"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Start over</span>
            </button>
          )}
          <div className="hidden items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-2.5 md:flex">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
              {APPLICANT.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="text-[12px] font-medium text-ink-soft">
              {APPLICANT.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Stepper() {
  const { step, maxReached, goTo } = useWizard();
  return (
    <div className="relative shrink-0 border-b border-line bg-white">
      {/* Animated progress underline — fills as the user advances. */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 h-[2.5px] rounded-r-full bg-gradient-to-r from-brand-400 to-brand-600"
        initial={false}
        animate={{ width: `${(step / (WIZARD_STEPS.length - 1)) * 100}%` }}
        transition={{ type: "spring", stiffness: 130, damping: 24 }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <ol className="no-scrollbar flex items-center gap-1 overflow-x-auto py-3">
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            const reachable = i <= maxReached;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-1">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && goTo(i)}
                  className={cn(
                    "group flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors",
                    reachable
                      ? "cursor-pointer hover:bg-surface-subtle"
                      : "cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors",
                      active
                        ? "border-brand-500 bg-brand-500 text-white shadow-glow"
                        : done
                          ? "border-transparent bg-[#12b76a]/12 text-[#0f9457]"
                          : "border-line bg-white text-ink-faint",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="hidden min-w-0 flex-col sm:flex">
                    <span
                      className={cn(
                        "truncate text-[13px] font-semibold",
                        active
                          ? "text-ink"
                          : done
                            ? "text-ink-soft"
                            : "text-ink-faint",
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="truncate text-[11px] text-ink-faint">
                      {s.hint}
                    </span>
                  </span>
                </button>
                {i < WIZARD_STEPS.length - 1 && (
                  <span
                    className={cn(
                      "hidden h-px flex-1 sm:block",
                      i < step ? "bg-[#12b76a]/40" : "bg-line",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function FooterNav() {
  const { step, next, back, restart, sourceName } = useWizard();
  const { status } = useStudio();

  const hasSelection = Boolean(sourceName);

  let primary: {
    label: string;
    icon: typeof ArrowRight;
    onClick: () => void;
    disabled?: boolean;
  } | null = null;
  if (step === 0)
    primary = {
      label: "Convert to 3D",
      icon: Sparkles,
      onClick: next,
      disabled: !hasSelection,
    };
  else if (step === 2)
    primary = { label: "Customize variants", icon: Palette, onClick: next };
  else if (step === 3)
    primary = { label: "Try it on", icon: Shirt, onClick: next };
  else if (step === 4)
    primary = { label: "Start over", icon: RotateCcw, onClick: restart };

  return (
    <footer className="sticky bottom-0 z-20 shrink-0 border-t border-line bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-soft shadow-soft transition-colors hover:bg-surface-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span
            className="hidden text-[12px] text-ink-faint sm:inline"
            title="This demo showcases the intended front-end experience using pre-generated 3D assets. A production build would integrate an Image-to-3D reconstruction pipeline."
          >
            Prototype demo · pre-generated 3D assets
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {step === 1 && (
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
              {status === "ready" ? "Finishing up…" : "Reconstructing…"}
            </span>
          )}

          {primary && (
            <motion.button
              type="button"
              onClick={primary.onClick}
              disabled={primary.disabled}
              whileHover={primary.disabled ? undefined : { scale: 1.03 }}
              whileTap={primary.disabled ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors",
                primary.disabled
                  ? "cursor-not-allowed bg-brand-500/40"
                  : "bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700",
              )}
            >
              <primary.icon className="h-4 w-4" />
              {primary.label}
            </motion.button>
          )}
        </div>
      </div>
    </footer>
  );
}
