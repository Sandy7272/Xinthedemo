"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SKILL_GROUPS } from "@/lib/data";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function TechnicalSkills() {
  return (
    <section id="skills" className="relative py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Capabilities"
          title="Technical Skills"
          description="The toolkit behind the workflow — spanning real-time 3D, AI-assisted capture, and modern frontend engineering."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2"
        >
          {SKILL_GROUPS.map((group) => (
            <motion.div key={group.label} variants={fadeUp}>
              <h3 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {group.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="cursor-default rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-soft transition-colors hover:border-ink/20 hover:text-ink"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
