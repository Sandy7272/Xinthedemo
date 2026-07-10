"use client";

import { motion } from "framer-motion";
import { Cpu, Info } from "lucide-react";
import { TECH_STACK } from "@/lib/easyvariants/config";

/** Technology stack + a subtle prototype disclaimer, shown after Try-On. */
export function TechShowcase() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-line bg-white/80 p-5 shadow-soft backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink">
            <Cpu className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-ink">
              Built with
            </h3>
            <p className="text-[13px] text-ink-muted">
              A modern, type-safe front-end 3D stack.
            </p>
          </div>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="flex flex-wrap gap-2"
        >
          {TECH_STACK.map((t) => (
            <motion.li
              key={t}
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ y: -2 }}
              className="rounded-full border border-line bg-surface-subtle px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {t}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Subtle prototype disclaimer */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-subtle px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
        <p className="text-[12px] leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink-soft">Prototype demo.</span>{" "}
          This showcases the intended front-end experience using pre-generated 3D
          assets. A production implementation would integrate an Image-to-3D
          reconstruction pipeline on the backend.
        </p>
      </div>
    </div>
  );
}
