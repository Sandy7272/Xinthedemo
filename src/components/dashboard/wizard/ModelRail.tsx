"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Box,
  MousePointer2,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { useWizard } from "./wizard-context";
import { MODEL_INFO } from "@/lib/easyvariants/config";

function SourceThumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Source"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#eef4ff_0%,#ffffff_74%)]">
      <ImageIcon className="h-6 w-6 text-brand-300" />
    </span>
  );
}

/** Side panel shown next to the viewer on the "3D Model" step. */
export function ModelRail() {
  const { source, sourceName } = useWizard();

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
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#12b76a]/12 text-[#0f9457]">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Reconstruction complete</p>
          <p className="text-[12px] text-ink-muted">Your model is ready to inspect.</p>
        </div>
      </motion.div>

      {/* before → after */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="flex items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3"
      >
        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
          <SourceThumb src={source} />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink">
          <Box className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink">
            {sourceName ?? "product image"}
          </p>
          <p className="text-[11px] text-ink-faint">2D image → 3D asset</p>
        </div>
      </motion.div>

      {/* model information */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      >
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          <Layers className="h-3.5 w-3.5" />
          Model Information
        </p>
        <dl className="grid grid-cols-2 gap-2">
          {MODEL_INFO.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-line bg-surface-subtle px-3 py-2"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                {s.label}
              </dt>
              <dd className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="mt-auto flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2.5 text-[12px] text-ink-muted"
      >
        <MousePointer2 className="h-3.5 w-3.5 shrink-0 text-brand-500" />
        Drag to rotate · scroll to zoom · use the toolbar to change the scene.
      </motion.div>
    </motion.div>
  );
}
