"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FEATURES } from "@/lib/data";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function FeatureCards() {
  return (
    <section id="workflow" className="relative py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="A complete image-to-3D workflow"
          description="From raw product photos to an optimized, textured asset — every step is engineered for e-commerce quality and web performance."
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-card"
              >
                {/* faint step number watermark */}
                <span className="pointer-events-none absolute right-5 top-4 text-5xl font-semibold text-surface-muted transition-colors group-hover:text-brand-50">
                  {feature.step}
                </span>

                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                  {feature.description}
                </p>

                {/* bottom accent line grows on hover */}
                <span className="mt-6 h-0.5 w-8 rounded-full bg-brand-500/70 transition-all duration-300 group-hover:w-16" />
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
