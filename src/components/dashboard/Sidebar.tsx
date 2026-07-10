"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Boxes,
  Shapes,
  Shirt,
  LayoutGrid,
  Download,
  Settings,
  Plus,
  HelpCircle,
  FileText,
  LifeBuoy,
  ChevronsUpDown,
  HardDrive,
  type LucideIcon,
} from "lucide-react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { BRAND, APPLICANT } from "@/lib/easyvariants/config";
import { cn } from "@/lib/cn";

type NavItem = { label: string; icon: LucideIcon; href: string; section: string };

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#top", section: "top" },
  { label: "My Conversions", icon: Boxes, href: "#history", section: "history" },
  { label: "Convert to 3D", icon: Shapes, href: "#studio", section: "studio" },
  { label: "Virtual Try-On", icon: Shirt, href: "#tryon", section: "tryon" },
  { label: "Templates", icon: LayoutGrid, href: "#top", section: "templates" },
  { label: "Exports", icon: Download, href: "#export", section: "export" },
  { label: "Settings", icon: Settings, href: "#top", section: "settings" },
];

const SPY_IDS = ["top", "studio", "variants", "tryon", "export", "history"];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const active = useScrollSpy(SPY_IDS);
  const activeSection = active === "variants" ? "studio" : active;

  return (
    <div className="flex h-full flex-col bg-[#0b0f1a] text-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-sm font-bold text-white">
          EV
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">{BRAND.name}</p>
          <p className="text-[11px] font-medium text-white/45">{BRAND.product}</p>
        </div>
      </div>

      {/* New Conversion */}
      <div className="px-4">
        <a
          href="#studio"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          New Conversion
        </a>
      </div>

      {/* Nav */}
      <nav className="mt-5 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-500/15 text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      isActive ? "text-brand-300" : "text-white/45 group-hover:text-white",
                    )}
                    strokeWidth={2}
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Workspace / storage card */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Workspace
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">EasyVariants Team</p>
          <p className="text-[12px] font-medium text-brand-300">Pro Plan</p>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/50">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Storage</span>
            <span className="ml-auto text-white/70">128 / 500 GB</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[26%] rounded-full bg-brand-500" />
          </div>

          <button
            type="button"
            className="mt-3.5 w-full rounded-lg border border-white/12 bg-white/5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
          >
            Upgrade Plan
          </button>
        </div>
      </nav>

      {/* Help links */}
      <div className="space-y-0.5 border-t border-white/8 px-3 py-3">
        {[
          { label: "Need Help?", icon: HelpCircle },
          { label: "View Documentation", icon: FileText },
          { label: "Contact Support", icon: LifeBuoy },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4 text-white/40" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="border-t border-white/8 px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {APPLICANT.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block truncate text-[13px] font-semibold text-white">
              {APPLICANT.name}
            </span>
            <span className="block text-[11px] text-white/45">Admin</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 text-white/40" />
        </button>
      </div>
    </div>
  );
}
