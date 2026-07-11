"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, MousePointer2 } from "lucide-react";
import { InspectorPanel } from "../viewer/inspector/InspectorPanel";

/** Side panel shown next to the viewer on the "3D Model" step: the studio inspector. */
export function LightingRail() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="flex flex-col gap-4 rounded-3xl border border-line bg-white/90 p-5 shadow-card backdrop-blur-xl lg:h-full lg:overflow-y-auto"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="flex items-center gap-2.5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Studio inspector</p>
          <p className="text-[12px] text-ink-muted">
            Professional lighting, camera and render controls.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      >
        <InspectorPanel />
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="mt-auto flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2.5 text-[12px] text-ink-muted"
      >
        <MousePointer2 className="h-3.5 w-3.5 shrink-0 text-brand-500" />
        Drag to rotate · scroll to zoom · every control updates live.
      </motion.div>
    </motion.div>
  );
}
