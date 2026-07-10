"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/config";
import { fadeUp, viewportOnce } from "@/lib/motion";
import {
  IconCube,
  IconUpload,
  IconArrowRight,
  IconGithub,
} from "@/components/ui/icons";

const FOOTER_LINKS = [
  { label: "Workflow", href: "#workflow" },
  { label: "Demo", href: "#demo" },
  { label: "Try-On", href: "#try-on" },
  { label: "Showcase", href: "#showcase" },
  { label: "Skills", href: "#skills" },
];

export function Footer() {
  return (
    <footer className="relative pb-10 pt-8">
      <div className="container-page">
        {/* CTA band */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-4xl bg-ink px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-72 w-[560px] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[100px]" />
            <div className="bg-dot-grid absolute inset-0 opacity-[0.12]" />
          </div>
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Bring your product catalog into 3D
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
              Explore the interactive demo, or start with your own product
              images and watch them come to life.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#demo">
                <Button
                  size="lg"
                  variant="secondary"
                  leftIcon={<IconUpload className="h-5 w-5" />}
                >
                  Upload Images
                </Button>
              </a>
              <a href="#demo">
                <Button
                  size="lg"
                  className="bg-white text-ink hover:bg-white/90"
                  rightIcon={<IconArrowRight className="h-5 w-5" />}
                >
                  Open Live Demo
                </Button>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-line pt-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-white">
              <IconCube className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-ink">{SITE.name}</p>
              <p className="text-ink-faint">Portfolio demo · Frontend only</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
          >
            <IconGithub className="h-4 w-4" />
            GitHub
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-ink-faint">
          Built with Next.js, TypeScript, Three.js &amp; Framer Motion. This is
          an interactive frontend demonstration — no AI backend is included.
        </p>
      </div>
    </footer>
  );
}
