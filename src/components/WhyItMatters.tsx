"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BENEFITS } from "@/lib/data";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function WhyItMatters() {
  return (
    <section id="why" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-surface-subtle" />
      <div className="container-page">
        <SectionHeading
          eyebrow="Why it matters"
          title="3D isn't a gimmick — it sells"
          description="Interactive product visualization moves the metrics that matter for modern e-commerce, from conversion to customer confidence."
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            const featured = i === 0;
            return (
              <motion.li
                key={benefit.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={
                  "group flex flex-col rounded-3xl border p-6 transition-shadow duration-300 " +
                  (featured
                    ? "border-transparent bg-ink text-white shadow-lift sm:col-span-2 lg:col-span-1"
                    : "border-line bg-white shadow-soft hover:shadow-card")
                }
              >
                <div
                  className={
                    "grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 " +
                    (featured
                      ? "bg-white/10 text-white"
                      : "bg-surface-muted text-ink")
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3
                  className={
                    "mt-4 text-base font-semibold tracking-tight " +
                    (featured ? "text-white" : "text-ink")
                  }
                >
                  {benefit.title}
                </h3>
                <p
                  className={
                    "mt-2 text-[14px] leading-relaxed " +
                    (featured ? "text-white/70" : "text-ink-muted")
                  }
                >
                  {benefit.description}
                </p>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
