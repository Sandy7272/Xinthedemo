"use client";

import type { ChangeEvent } from "react";
import { cn } from "@/lib/cn";

type SliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
};

/**
 * Premium range slider with a filled track and live value badge.
 * Uses a CSS gradient on the track to visualise the current position.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  format = (v) => v.toFixed(2),
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[13px] font-medium text-ink-soft">{label}</label>
        <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs text-ink-muted tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(parseFloat(e.target.value))
        }
        className="range-input h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, #0a0a0b ${pct}%, #e4e4e7 ${pct}%)`,
        }}
      />
    </div>
  );
}
