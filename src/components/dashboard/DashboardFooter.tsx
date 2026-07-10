"use client";

import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-line py-6 sm:flex-row">
      <p className="text-[12px] text-ink-faint">
        © {new Date().getFullYear()} EasyVariants. All rights reserved.
      </p>
      <div className="flex items-center gap-5 text-[12px]">
        <a
          href="https://www.easyvariants.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted transition-colors hover:text-ink"
        >
          Privacy Policy
        </a>
        <a
          href="https://www.easyvariants.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted transition-colors hover:text-ink"
        >
          Terms of Service
        </a>
        <Link href="/" className="text-ink-muted transition-colors hover:text-ink">
          Portfolio
        </Link>
      </div>
    </footer>
  );
}
