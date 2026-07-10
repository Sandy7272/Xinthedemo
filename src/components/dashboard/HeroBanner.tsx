"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  Upload,
  Target,
  Database,
  BadgeCheck,
  Check,
  TrendingUp,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const HeroGarment3D = dynamic(() => import("./HeroGarment3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand-500" />
    </div>
  ),
});

const CHIPS = [
  { icon: Target, label: "High Accuracy" },
  { icon: Database, label: "Data Driven" },
  { icon: BadgeCheck, label: "Production Ready" },
];

const PREVIEW = [
  "6 Views Uploaded",
  "Metadata Added",
  "Scale Matched",
  "Model Reconstructed",
  "Textures Applied",
  "Ready to Export",
];

export function HeroBanner() {
  return (
    <motion.section
      id="top"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-card"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 h-[420px] w-[520px] rounded-full bg-brand-100/40 blur-[120px]" />
      </div>

      <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_1.25fr]">
        {/* Copy */}
        <div>
          <motion.span variants={fadeUp} className="eyebrow">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Multi-View to 3D
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-4 text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl"
          >
            Convert Multi-View Product Images into{" "}
            <span className="text-brand-600">Production Ready 3D Assets</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-3.5 max-w-md text-[15px] leading-relaxed text-ink-muted"
          >
            Upload multi-view images and product metadata to generate accurate,
            realistic 3D models.
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
            {CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <li
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-subtle px-3 py-1.5 text-[12px] font-medium text-ink-soft"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-500" />
                  {chip.label}
                </li>
              );
            })}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            <a
              href="#studio"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-brand-600"
            >
              <Play className="h-4 w-4" />
              Start Conversion
            </a>
            <a
              href="#studio"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-subtle"
            >
              <Upload className="h-4 w-4" />
              Upload Sample
            </a>
          </motion.div>
        </div>

        {/* Visual + preview */}
        <motion.div variants={fadeUp} className="flex items-stretch gap-4">
          <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-subtle to-white sm:min-h-[300px]">
            <HeroGarment3D />
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-muted shadow-soft backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#12b76a]" />
              Live 3D
            </div>
          </div>

          {/* Conversion preview */}
          <div className="hidden w-[190px] shrink-0 flex-col rounded-2xl border border-line bg-white p-4 shadow-soft sm:flex">
            <p className="text-[13px] font-semibold text-ink">Conversion Preview</p>
            <ul className="mt-3 space-y-2.5">
              {PREVIEW.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#12b76a]/12 text-[#0f9457]">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-[12px] text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[11px] text-ink-faint">Est. Quality</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0f9457]">
                <TrendingUp className="h-3.5 w-3.5" />
                High
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
