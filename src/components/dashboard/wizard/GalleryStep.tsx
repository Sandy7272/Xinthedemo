"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Shirt,
  Image as ImageIcon,
  MousePointerClick,
} from "lucide-react";
import { useWizard } from "./wizard-context";
import { PRODUCTS, type StudioProduct } from "@/lib/easyvariants/config";
import { cn } from "@/lib/cn";

const BOX = "h-[250px] sm:h-[290px]";

/** A selectable sample product — the whole card is a click target. */
function ProductCard({
  product,
  active,
  onSelect,
}: {
  product: StudioProduct;
  active: boolean;
  onSelect: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200",
        active
          ? "border-brand-500 shadow-card ring-2 ring-brand-200"
          : "border-line hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card",
      )}
    >
      <div className={cn("relative overflow-hidden bg-surface-muted", BOX)}>
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
          Sample
        </span>
        {active && (
          <span className="absolute right-4 top-4 z-10 grid h-7 w-7 place-items-center rounded-full bg-[#12b76a] text-white shadow-glow">
            <Check className="h-4 w-4" />
          </span>
        )}
        {product.image && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.label}
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${product.tint} 0%, #ffffff 74%)`,
            }}
          >
            <ImageIcon className="h-10 w-10 text-brand-300" />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-soft">
            <Shirt className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">
              {product.label}
            </p>
            <span className="mt-1 flex items-center gap-1">
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                3D Model
              </span>
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                Try-On
              </span>
            </span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors",
            active
              ? "bg-[#12b76a] text-white"
              : "bg-brand-500 text-white",
          )}
        >
          {active ? (
            <>
              <Check className="h-4 w-4" />
              Selected
            </>
          ) : (
            "Use sample"
          )}
        </span>
      </div>
    </div>
  );
}

export function GalleryStep() {
  const { sourceName, selectProduct } = useWizard();

  const hasSelection = PRODUCTS.some((p) => p.name === sourceName);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto w-full max-w-3xl"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className="mb-6 text-center"
      >
        <h2 className="inline-flex items-start gap-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          Choose a product
          <Sparkles className="mt-1 h-5 w-5 text-brand-500" />
        </h2>
        <p className="mt-2 text-[14px] text-ink-muted">
          Pick a sample product to generate its 3D model.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        {PRODUCTS.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <ProductCard
              product={product}
              active={sourceName === product.name}
              onSelect={() => selectProduct(product)}
            />
          </motion.div>
        ))}
      </div>

      {/* Selection nudge — swaps to a "ready" note once a product is picked. */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className={cn(
          "mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
          hasSelection
            ? "border-[#12b76a]/30 bg-[#12b76a]/5"
            : "border-line bg-brand-50/40",
        )}
      >
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            hasSelection
              ? "bg-[#12b76a]/10 text-[#0f9457]"
              : "bg-brand-100/60 text-brand-600",
          )}
        >
          {hasSelection ? (
            <Check className="h-[18px] w-[18px]" />
          ) : (
            <MousePointerClick className="h-[18px] w-[18px]" />
          )}
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">
            {hasSelection
              ? "Great choice — you're ready to go"
              : "Select a product to continue"}
          </p>
          <p className="text-[12px] text-ink-muted">
            {hasSelection
              ? "Press Convert to 3D below to start the reconstruction."
              : "Click a sample card above — the Convert to 3D button unlocks once one is selected."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
