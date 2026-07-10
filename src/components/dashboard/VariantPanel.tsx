"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Palette, Check, Plus } from "lucide-react";
import { Panel } from "./ui/Panel";
import { useStudio } from "./studio-context";
import {
  COLOR_SWATCHES,
  FABRIC_PRESETS,
  LOGO_OPTIONS,
} from "@/lib/easyvariants/config";
import type { VariantTab } from "@/lib/easyvariants/types";
import { cn } from "@/lib/cn";

const TABS: { id: VariantTab; label: string }[] = [
  { id: "color", label: "Color" },
  { id: "fabric", label: "Fabric" },
  { id: "logo", label: "Logo" },
];

export function VariantPanel() {
  const {
    variantTab,
    setVariantTab,
    baseColor,
    setBaseColor,
    logoId,
    setLogo,
    fabricId,
    setFabric,
  } = useStudio();

  const tab = variantTab === "material" ? "color" : variantTab;

  return (
    <Panel
      title="Variants & Appearance"
      description="Swap product options instantly."
      icon={Palette}
    >
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-muted p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setVariantTab(t.id)}
              className={cn(
                "relative flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="variant-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[92px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "color" && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setBaseColor("original")}
                  title="Original colour"
                  className={cn(
                    "grid h-9 place-items-center rounded-full border px-3 text-[12px] font-semibold transition-colors",
                    baseColor === "original"
                      ? "border-ink bg-ink text-white"
                      : "border-line text-ink-muted hover:border-ink/30 hover:text-ink",
                  )}
                >
                  Original
                </button>
                {COLOR_SWATCHES.map((s) => {
                  const active = baseColor.toLowerCase() === s.value.toLowerCase();
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setBaseColor(s.value)}
                      title={s.name}
                      aria-label={s.name}
                      className={cn(
                        "relative grid h-9 w-9 place-items-center rounded-full border transition-transform hover:scale-110",
                        active ? "border-ink ring-2 ring-brand-200" : "border-line",
                      )}
                      style={{ backgroundColor: s.value }}
                    >
                      {active && (
                        <Check
                          className={cn(
                            "h-4 w-4",
                            s.value === "#f4f4f5" ? "text-ink" : "text-white",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
                <label
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-dashed border-line text-ink-faint transition-colors hover:border-ink/30 hover:text-ink"
                  title="Custom color"
                >
                  <Plus className="h-4 w-4" />
                  <input
                    type="color"
                    value={baseColor === "original" ? "#d92d20" : baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {tab === "fabric" && (
              <div className="grid grid-cols-2 gap-2">
                {FABRIC_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFabric(f.id)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all",
                      fabricId === f.id
                        ? "border-ink bg-surface-subtle"
                        : "border-line hover:border-ink/20",
                    )}
                  >
                    <span className="flex w-full items-center justify-between text-[13px] font-semibold text-ink">
                      {f.name}
                      {fabricId === f.id && <Check className="h-4 w-4" />}
                    </span>
                    <span className="mt-0.5 text-[11px] text-ink-faint">
                      Normal ×{f.normalScale.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === "logo" && (
              <div className="grid grid-cols-2 gap-2">
                {LOGO_OPTIONS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLogo(l.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                      logoId === l.id
                        ? "border-ink bg-surface-subtle"
                        : "border-line hover:border-ink/20",
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-sm font-semibold text-white">
                      {l.monogram || "—"}
                    </span>
                    <span className="text-[13px] font-medium text-ink">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent fabric selector (as in the reference) */}
      <div className="mt-4 border-t border-line pt-4">
        <label className="mb-1.5 block text-[12px] font-medium text-ink-soft">
          Fabric
        </label>
        <select
          value={fabricId}
          onChange={(e) => setFabric(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink shadow-soft transition-colors focus:border-brand-400 focus:outline-none"
        >
          {FABRIC_PRESETS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
    </Panel>
  );
}
