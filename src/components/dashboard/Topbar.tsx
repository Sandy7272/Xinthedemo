"use client";

import { Bell, ChevronRight, Play, PanelLeft, ChevronDown } from "lucide-react";
import { APPLICANT } from "@/lib/easyvariants/config";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const initials = APPLICANT.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-surface-subtle lg:hidden"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-ink-muted">Convert to 3D</span>
          <ChevronRight className="h-4 w-4 text-ink-faint" />
          <span className="font-semibold text-ink">New Conversion</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-subtle"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Watch Demo</span>
          </a>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-surface-subtle"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-2 transition-colors hover:bg-surface-subtle"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">
              {initials}
            </span>
            <ChevronDown className="h-4 w-4 text-ink-faint" />
          </button>
        </div>
      </div>
    </header>
  );
}
