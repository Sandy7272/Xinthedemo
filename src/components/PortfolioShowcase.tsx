"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PORTFOLIO_MODELS, type PortfolioModel } from "@/lib/config";
import { CATEGORY_ICONS } from "@/lib/data";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import {
  IconCheck,
  IconArrowUpRight,
  IconEye,
  IconCube,
} from "@/components/ui/icons";

export function PortfolioShowcase() {
  return (
    <section id="showcase" className="relative py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Portfolio"
          title="Real Project Showcase"
          description="A selection of product categories digitized into interactive 3D. Open any model to explore it in a live viewer."
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PORTFOLIO_MODELS.map((model) => (
            <PortfolioCard key={model.id} model={model} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function PortfolioCard({ model }: { model: PortfolioModel }) {
  const Icon = CATEGORY_ICONS[model.category] ?? IconCube;
  const isPlaceholder = model.modelUrl.startsWith("YOUR_MODEL_LINK");

  return (
    <motion.li
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-shadow duration-300 hover:shadow-card"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${model.accent}1a 0%, #ffffff 72%)`,
        }}
      >
        <div className="bg-dot-grid absolute inset-0 opacity-40" />
        <motion.div
          initial={{ y: 0 }}
          whileHover={{ rotate: 8 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            className="grid h-20 w-20 place-items-center rounded-3xl text-white shadow-lift transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: model.accent }}
          >
            <Icon className="h-10 w-10" />
          </span>
        </motion.div>

        {/* status badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#0f9457] shadow-soft backdrop-blur">
          <IconCheck className="h-3.5 w-3.5" />
          {model.status}
        </span>

        {/* interactive viewer hint */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-white shadow-soft backdrop-blur">
          <IconEye className="h-3.5 w-3.5" />
          Interactive
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {model.category}
        </span>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">
          {model.title}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
          {model.description}
        </p>

        <a
          href={isPlaceholder ? undefined : model.modelUrl}
          target={isPlaceholder ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-disabled={isPlaceholder}
          onClick={(e) => isPlaceholder && e.preventDefault()}
          className={
            "mt-5 inline-flex items-center justify-between rounded-2xl border border-line px-4 py-2.5 text-sm font-medium transition-all " +
            (isPlaceholder
              ? "cursor-not-allowed text-ink-faint"
              : "text-ink hover:border-ink/20 hover:bg-surface-subtle")
          }
          title={isPlaceholder ? "Set this model link in src/lib/config.ts" : "Open model"}
        >
          {isPlaceholder ? "Add model link" : "Open Model"}
          <IconArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </motion.li>
  );
}
