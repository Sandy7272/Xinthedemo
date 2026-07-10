"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStudio } from "./studio-context";

type Guide = {
  id: string;
  label: string;
  value: string;
  /** SVG line in 0-100 viewBox coordinates. */
  line: { x1: number; y1: number; x2: number; y2: number };
  chip: { x: number; y: number };
};

export function DimensionsOverlay() {
  const { toggles, metadata } = useStudio();
  const [hover, setHover] = useState<string | null>(null);

  const guides: Guide[] = [
    {
      id: "height",
      label: "Height",
      value: `${metadata.height} cm`,
      line: { x1: 16, y1: 16, x2: 16, y2: 84 },
      chip: { x: 16, y: 50 },
    },
    {
      id: "width",
      label: "Width",
      value: `${metadata.width} cm`,
      line: { x1: 28, y1: 88, x2: 72, y2: 88 },
      chip: { x: 50, y: 88 },
    },
    {
      id: "sleeve",
      label: "Sleeve",
      value: metadata.sleeveType,
      line: { x1: 70, y1: 34, x2: 86, y2: 56 },
      chip: { x: 82, y: 44 },
    },
    {
      id: "neck",
      label: "Neck",
      value: metadata.neckType,
      line: { x1: 43, y1: 20, x2: 57, y2: 20 },
      chip: { x: 50, y: 15 },
    },
    {
      id: "depth",
      label: "Depth",
      value: `${metadata.depth} cm`,
      line: { x1: 78, y1: 74, x2: 88, y2: 80 },
      chip: { x: 86, y: 70 },
    },
  ];

  return (
    <AnimatePresence>
      {toggles.showDimensions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10"
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <marker
                id="dim-arrow"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#3366ff" />
              </marker>
            </defs>
            {guides.map((g) => (
              <line
                key={g.id}
                x1={g.line.x1}
                y1={g.line.y1}
                x2={g.line.x2}
                y2={g.line.y2}
                stroke="#3366ff"
                strokeWidth={0.5}
                strokeDasharray="2 1.5"
                markerStart="url(#dim-arrow)"
                markerEnd="url(#dim-arrow)"
                vectorEffect="non-scaling-stroke"
                opacity={0.85}
              />
            ))}
          </svg>

          {/* Interactive chips (percent positioned) */}
          {guides.map((g) => (
            <div
              key={g.id}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${g.chip.x}%`, top: `${g.chip.y}%` }}
              onMouseEnter={() => setHover(g.id)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-brand-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-brand-700 shadow-soft backdrop-blur">
                <span className="h-1 w-1 rounded-full bg-brand-500" />
                {g.label}
                <AnimatePresence>
                  {hover === g.id && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-ink"
                    >
                      · {g.value}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
