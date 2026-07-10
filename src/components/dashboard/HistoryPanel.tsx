"use client";

import { motion } from "framer-motion";
import { History, Download, Shirt, Loader2, Check, X } from "lucide-react";
import { Panel } from "./ui/Panel";
import { HISTORY_ITEMS } from "@/lib/easyvariants/config";
import type { HistoryItem } from "@/lib/easyvariants/types";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";

const STATUS: Record<
  HistoryItem["status"],
  { cls: string; icon: typeof Check }
> = {
  Completed: { cls: "bg-[#12b76a]/10 text-[#0f9457]", icon: Check },
  Processing: { cls: "bg-amber-100 text-amber-700", icon: Loader2 },
  Failed: { cls: "bg-[#e5484d]/10 text-[#c0353a]", icon: X },
};

export function HistoryPanel() {
  return (
    <Panel
      title="8. Recent Conversions"
      icon={History}
      actions={
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          View All
        </button>
      }
      noPadding
    >
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="divide-y divide-line"
      >
        {HISTORY_ITEMS.map((item) => {
          const s = STATUS[item.status];
          const StatusIcon = s.icon;
          const done = item.status === "Completed";
          return (
            <motion.li
              key={item.id}
              variants={fadeUp}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-subtle"
            >
              {/* thumb + name */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-soft"
                  style={{ backgroundColor: item.accent }}
                >
                  <Shirt className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-ink-faint">{item.category}</p>
                </div>
              </div>

              {/* status */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  s.cls,
                )}
              >
                <StatusIcon
                  className={cn(
                    "h-3 w-3",
                    item.status === "Processing" && "animate-spin",
                  )}
                />
                {item.status}
              </span>

              {/* date */}
              <span className="hidden w-24 text-right text-[12px] text-ink-muted sm:block">
                {item.date}
              </span>

              {/* size */}
              <span className="hidden w-16 text-right text-[12px] tabular-nums text-ink-muted md:block">
                {item.size}
              </span>

              {/* download */}
              <button
                type="button"
                disabled={!done}
                aria-label="Download"
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                  done
                    ? "text-ink-soft hover:bg-surface-muted hover:text-ink"
                    : "cursor-not-allowed text-ink-faint/50",
                )}
              >
                <Download className="h-4 w-4" />
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </Panel>
  );
}
