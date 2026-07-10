"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  UploadCloud,
  Check,
  Sparkles,
  Shirt,
  Image as ImageIcon,
} from "lucide-react";
import { useWizard } from "./wizard-context";
import { PRODUCTS, type StudioProduct } from "@/lib/easyvariants/config";
import { cn } from "@/lib/cn";

const BOX = "h-[220px] sm:h-[240px]";

/** A single selectable sample product (image + 3D asset + try-on). */
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
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-200",
        active
          ? "border-brand-500 shadow-card ring-2 ring-brand-200"
          : "border-line hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card",
      )}
    >
      <div className={cn("relative overflow-hidden", BOX)}>
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
          Sample
        </span>
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
            <p className="text-[11px] text-ink-faint">Sample product</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors",
            active
              ? "bg-[#12b76a] text-white"
              : "bg-brand-500 text-white hover:bg-brand-600",
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
        </button>
      </div>
    </div>
  );
}

export function GalleryStep() {
  const { source, sourceName, setSource, selectProduct } = useWizard();
  const fileRef = useRef<HTMLInputElement>(null);
  const lastUpload = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // A sample is active when the current selection matches one of the products;
  // otherwise (a name that isn't a product) it's a user upload.
  const uploadActive =
    Boolean(sourceName) && !PRODUCTS.some((p) => p.name === sourceName);

  const onUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (lastUpload.current) URL.revokeObjectURL(lastUpload.current);
    const url = URL.createObjectURL(file);
    lastUpload.current = url;
    setSource(url, file.name);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 text-center">
        <h2 className="inline-flex items-start gap-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          Choose a product image
          <Sparkles className="mt-1 h-5 w-5 text-brand-500" />
        </h2>
        <p className="mt-2 text-[14px] text-ink-muted">
          Select a sample or upload your own to generate a 3D model.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sample products */}
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            active={sourceName === product.name}
            onSelect={() => selectProduct(product)}
          />
        ))}

        {/* Upload your own */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            // h-full keeps the tile flush with the product cards' bottom edge
            "flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-colors",
            dragging
              ? "border-brand-500 bg-brand-50"
              : uploadActive
                ? "border-brand-500 bg-brand-50/40"
                : "border-line bg-surface-subtle hover:border-brand-400 hover:bg-brand-50/30",
          )}
        >
          {uploadActive && source ? (
            <span className="relative h-full w-full overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source}
                alt={sourceName ?? "upload"}
                className="h-full w-full object-contain"
              />
              <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white shadow-glow">
                <Check className="h-3.5 w-3.5" />
              </span>
            </span>
          ) : (
            <>
              <span className="relative grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-glow">
                <UploadCloud className="h-6 w-6" />
                <Sparkles className="absolute -right-2 -top-1 h-3.5 w-3.5 text-brand-300" />
                <Sparkles className="absolute -left-2 top-1 h-3 w-3 text-brand-200" />
                <Sparkles className="absolute -bottom-1 right-0 h-3 w-3 text-brand-200" />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">
                Upload your image
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                JPG or PNG · from your device
              </p>
              <span className="mt-4 inline-flex items-center rounded-xl border border-brand-300 bg-white px-4 py-2 text-[13px] font-semibold text-brand-600 shadow-soft">
                Choose file
              </span>
              <p className="mt-2 text-[12px] text-ink-faint">or drag and drop here</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-brand-50/40 px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100/60 text-brand-600">
          <Sparkles className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Demo experience</p>
          <p className="text-[12px] text-ink-muted">
            Everything runs in your browser. No image leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
