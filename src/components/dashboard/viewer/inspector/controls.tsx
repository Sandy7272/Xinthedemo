"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shared primitives for the studio inspector. Everything reuses the
 * dashboard's design tokens (line / ink / surface / brand) so the
 * inspector reads as part of the existing UI, not a bolted-on GUI.
 */

// ── Collapsible section ─────────────────────────────────────
export function Section({
  title,
  icon: Icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-surface-subtle"
      >
        {Icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
          {title}
        </span>
        {badge}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-4 border-t border-line px-3.5 py-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Switch ──────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  /** Accessible name — required even when rendered without visible text. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-500" : "bg-ink-faint/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[16px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

/** Label + switch on one row. */
export function ToggleRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        {hint && <p className="text-[11px] text-ink-faint">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ── Select ──────────────────────────────────────────────────
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-label={label}
          className="w-full cursor-pointer appearance-none rounded-lg border border-line bg-white py-1.5 pl-3 pr-8 text-[13px] font-medium text-ink shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
      </div>
    </div>
  );
}

// ── Color ───────────────────────────────────────────────────
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[13px] font-medium text-ink-soft">{label}</label>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-ink-muted">
          {value}
        </span>
        <span className="relative h-6 w-9 overflow-hidden rounded-lg border border-line shadow-soft">
          <input
            type="color"
            value={value}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] cursor-pointer border-0 p-0"
          />
        </span>
      </span>
    </div>
  );
}

// ── Small utility button ────────────────────────────────────
export function MiniButton({
  onClick,
  icon: Icon,
  children,
  className,
}: {
  onClick: () => void;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-soft shadow-soft transition-colors hover:bg-surface-subtle hover:text-ink",
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

/** Card that groups a light's controls; dims + collapses when disabled. */
export function ControlBlock({
  title,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface-subtle p-3 transition-opacity",
        !enabled && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-ink">{title}</span>
        <Toggle checked={enabled} onChange={onToggle} label={`${title} enabled`} />
      </div>
      {enabled && children && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}
