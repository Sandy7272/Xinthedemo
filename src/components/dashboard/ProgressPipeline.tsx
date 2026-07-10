"use client";

import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Boxes,
  Palette,
  Gauge,
  PackageCheck,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useStudio } from "./studio-context";
import { PIPELINE_STEPS } from "@/lib/easyvariants/config";
import type { PipelineStepId } from "@/lib/easyvariants/types";
import { cn } from "@/lib/cn";

const ICONS: Record<PipelineStepId, LucideIcon> = {
  upload: Upload,
  metadata: FileText,
  reconstruction: Boxes,
  texturing: Palette,
  optimization: Gauge,
  export: PackageCheck,
};

export function ProgressPipeline() {
  const { pipelineIndex, status } = useStudio();
  // Before any run, show the first step as the current one.
  const current = status === "idle" ? 0 : pipelineIndex;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Conversion Pipeline</h3>
        <span className="text-xs font-medium text-ink-faint">
          {status === "ready"
            ? "Completed"
            : status === "generating"
              ? "Processing…"
              : "Ready"}
        </span>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <ol className="flex min-w-[680px] items-start">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = ICONS[step.id];
            const isDone = current > i || status === "ready";
            const isActive = current === i && status !== "ready";
            const isLast = i === PIPELINE_STEPS.length - 1;
            return (
              <li key={step.id} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "h-[2px] flex-1 rounded-full",
                      i === 0
                        ? "bg-transparent"
                        : isDone || isActive
                          ? "bg-brand-500"
                          : "border-t-2 border-dashed border-line bg-transparent",
                    )}
                  />
                  <motion.span
                    initial={false}
                    animate={{ scale: isActive ? [1, 1.08, 1] : 1 }}
                    transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isDone
                        ? "border-brand-500 bg-brand-500 text-white"
                        : isActive
                          ? "border-brand-500 bg-brand-50 text-brand-600"
                          : "border-line bg-surface-subtle text-ink-faint",
                    )}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </motion.span>
                  <span
                    className={cn(
                      "h-[2px] flex-1 rounded-full",
                      isLast
                        ? "bg-transparent"
                        : isDone
                          ? "bg-brand-500"
                          : "border-t-2 border-dashed border-line bg-transparent",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2.5 text-center text-[12px] font-medium transition-colors",
                    isActive
                      ? "text-brand-600"
                      : isDone
                        ? "text-ink"
                        : "text-ink-faint",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
