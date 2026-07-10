"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
};

/** Standard dashboard card with an optional header row. */
export function Panel({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  children,
  className,
  bodyClassName,
  noPadding,
}: PanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-line bg-white shadow-soft",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-ink">
                  {title}
                </h3>
                {badge}
              </div>
              {description && (
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className={cn(!noPadding && "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
