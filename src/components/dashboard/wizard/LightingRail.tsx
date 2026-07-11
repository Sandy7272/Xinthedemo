"use client";

import { motion } from "framer-motion";
import { Sun, SunMedium, Shirt, RotateCcw, MousePointer2 } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { useStudio, type LightDirection } from "../studio-context";
import { cn } from "@/lib/cn";

const DIRECTIONS: { id: LightDirection; label: string; hint: string }[] = [
  { id: "left", label: "Left", hint: "Light from the left of the model" },
  { id: "top", label: "Top", hint: "Light from above the model" },
  { id: "right", label: "Right", hint: "Light from the right of the model" },
];

/** Where the sun sits inside each preset button's mini diagram. */
const SUN_POS: Record<LightDirection, string> = {
  left: "left-2.5 top-2",
  top: "left-1/2 top-1.5 -translate-x-1/2",
  right: "right-2.5 top-2",
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Side panel shown next to the viewer on the "3D Model" step: lighting controls. */
export function LightingRail() {
  const { lighting, setLighting, resetLighting } = useStudio();

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
          <SunMedium className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Lighting controls</p>
          <p className="text-[12px] text-ink-muted">
            Set where light hits your model and how strong it is.
          </p>
        </div>
      </motion.div>

      {/* light direction */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          Light position
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DIRECTIONS.map((d) => {
            const active = lighting.direction === d.id;
            return (
              <button
                key={d.id}
                type="button"
                title={d.hint}
                aria-pressed={active}
                onClick={() => setLighting({ direction: d.id })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border p-2 pt-1.5 transition-all",
                  active
                    ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100"
                    : "border-line bg-surface-subtle hover:border-ink-faint/50 hover:bg-white",
                )}
              >
                {/* mini diagram: sun position relative to the garment */}
                <span className="relative h-12 w-full">
                  <Sun
                    className={cn(
                      "absolute h-4 w-4 transition-colors",
                      SUN_POS[d.id],
                      active ? "text-amber-500" : "text-ink-faint",
                    )}
                  />
                  <Shirt
                    className={cn(
                      "absolute bottom-1 left-1/2 h-5 w-5 -translate-x-1/2 transition-colors",
                      active ? "text-ink" : "text-ink-faint",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[12px] font-semibold",
                    active ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* intensity */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="space-y-4 rounded-2xl border border-line bg-surface-subtle p-3.5"
      >
        <Slider
          label="Light intensity"
          value={lighting.intensity}
          min={0}
          max={4}
          step={0.05}
          onChange={(v) => setLighting({ intensity: v })}
          format={pct}
        />
        <Slider
          label="Ambient fill"
          value={lighting.ambient}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => setLighting({ ambient: v })}
          format={pct}
        />
      </motion.div>

      <motion.button
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        type="button"
        onClick={resetLighting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-[13px] font-medium text-ink-soft shadow-soft transition-colors hover:bg-surface-subtle"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset lighting
      </motion.button>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="mt-auto flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2.5 text-[12px] text-ink-muted"
      >
        <MousePointer2 className="h-3.5 w-3.5 shrink-0 text-brand-500" />
        Drag to rotate · scroll to zoom · lighting updates live.
      </motion.div>
    </motion.div>
  );
}
