"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { IconCube, IconClose, IconArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "Workflow", href: "#workflow" },
  { label: "Demo", href: "#demo" },
  { label: "Try-On", href: "#try-on" },
  { label: "Showcase", href: "#showcase" },
  { label: "Skills", href: "#skills" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container-page pt-3 sm:pt-4">
        <nav
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 transition-all duration-300 sm:px-4",
            scrolled
              ? "border border-line bg-white/80 shadow-soft backdrop-blur-xl"
              : "border border-transparent bg-transparent",
          )}
        >
          <a href="#top" className="flex items-center gap-2.5 pl-1">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white shadow-soft">
              <IconCube className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              Image-to-3D
              <span className="text-ink-faint"> Studio</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href="#demo" className="hidden sm:block">
              <Button size="sm" rightIcon={<IconArrowRight className="h-4 w-4" />}>
                Try the Demo
              </Button>
            </a>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink md:hidden"
            >
              {menuOpen ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <span className="flex flex-col gap-[5px]">
                  <span className="h-0.5 w-5 rounded-full bg-ink" />
                  <span className="h-0.5 w-5 rounded-full bg-ink" />
                </span>
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-2xl border border-line bg-white/95 p-2 shadow-card backdrop-blur-xl md:hidden"
            >
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
