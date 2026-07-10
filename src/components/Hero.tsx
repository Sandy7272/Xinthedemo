"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  IconUpload,
  IconPlay,
  IconSparkles,
  IconImage,
  IconArrowRight,
  IconCube,
} from "@/components/ui/icons";
import { fadeUp, staggerContainer, easeOutExpo } from "@/lib/motion";

const VIEWS = ["Front", "Back", "Left", "Right", "Top"];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24"
    >
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-grid opacity-[0.6]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-grid-fade" />
        <div className="absolute left-1/2 top-24 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-100/40 blur-[120px]" />
      </div>

      <div className="container-page">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            <IconSparkles className="h-3.5 w-3.5 text-brand-500" />
            AI-Powered Product Visualization
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl md:text-[64px] md:leading-[1.06]"
          >
            Transform Product Images into{" "}
            <span className="text-gradient">Production-Ready 3D Models</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl"
          >
            Upload product images and experience an AI-powered workflow for
            generating interactive, web-ready 3D assets for e-commerce and
            product visualization.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <a href="#demo">
              <Button size="lg" leftIcon={<IconUpload className="h-5 w-5" />}>
                Upload Images
              </Button>
            </a>
            <a href="#demo">
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<IconPlay className="h-4 w-4" />}
              >
                View Interactive Demo
              </Button>
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-sm text-ink-faint"
          >
            Interactive frontend demo · Three.js · WebGL · No sign-up required
          </motion.p>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** Illustrative "multi-view → 3D" workflow panel below the headline. */
function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.25 }}
      className="mx-auto mt-16 max-w-5xl"
    >
      <div className="relative rounded-4xl border border-line bg-white/70 p-3 shadow-lift backdrop-blur-sm sm:p-4">
        <div className="grid items-center gap-4 rounded-3xl bg-surface-subtle p-5 sm:grid-cols-[1fr_auto_1fr] sm:p-8">
          {/* Left: multi-view image tiles */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Input · Multi-View Images
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {VIEWS.map((view, i) => (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.09, ease: easeOutExpo }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white"
                >
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 35%, #eef4ff 0%, #f7f8fa 60%, #eef0f3 100%)",
                    }}
                  />
                  <IconImage className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-brand-300" />
                  <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-ink-faint">
                    {view}
                  </span>
                </motion.div>
              ))}
              <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-line text-ink-faint">
                <span className="text-[11px] font-medium">+ Add</span>
              </div>
            </div>
          </div>

          {/* Center: arrow */}
          <div className="flex items-center justify-center py-1 sm:flex-col">
            <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 shadow-soft">
              <IconSparkles className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-medium text-ink-muted">AI</span>
              <IconArrowRight className="h-4 w-4 text-ink-faint" />
            </div>
          </div>

          {/* Right: 3D result */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Output · Interactive 3D
            </p>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-white to-surface-muted">
              <div className="bg-dot-grid absolute inset-0 opacity-40" />
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: "preserve-3d" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <IconCube className="h-24 w-24 text-ink" strokeWidth={1} />
              </motion.div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-muted shadow-soft backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
                Web-Ready · GLB
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
