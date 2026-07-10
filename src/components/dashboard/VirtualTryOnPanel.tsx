"use client";

import { useCallback, useEffect, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shirt,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  RotateCw,
  Download,
  Loader2,
} from "lucide-react";
import { Panel } from "./ui/Panel";
import { TryOnScene } from "@/components/tryon/TryOnScenes";
import { FileExplorerModal } from "./ui/FileExplorerModal";
import { SAMPLE_PERSON_IMAGES } from "@/lib/easyvariants/config";
import { useWizard } from "./wizard/wizard-context";
import { cn } from "@/lib/cn";

type Status = "idle" | "loading" | "result";

const STEPS = [
  "Analyzing Image…",
  "Detecting Human Pose…",
  "Fitting Garment…",
  "Rendering Preview…",
];

const BOX = "h-[260px] sm:h-[288px]";

/** Small image with graceful fallback to the mannequin figure. */
function SmartImage({
  src,
  styled,
  alt,
  fit = "cover",
}: {
  src: string | null;
  styled: boolean;
  alt: string;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
        onError={() => setFailed(true)}
      />
    );
  }
  return <TryOnScene styled={styled} />;
}

/** Numbered column label — reads as a mini 1→2→3 pipeline. */
function StepLabel({ n, children }: { n: number; children: string }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-[12px] font-medium text-ink-muted">
      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold leading-none text-white">
        {n}
      </span>
      {children}
    </p>
  );
}

/** Neutral card shown until a real product image is wired up. */
function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(45deg,#fafafa_0px,#fafafa_10px,#f4f4f5_10px,#f4f4f5_20px)] text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-line bg-white text-ink-faint shadow-soft">
        <Shirt className="h-6 w-6" />
      </span>
      <p className="px-4 text-[12px] font-medium text-ink-faint">
        Add your garment image
      </p>
    </div>
  );
}

export function VirtualTryOnPanel() {
  const { product } = useWizard();
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [photoIsObjectUrl, setPhotoIsObjectUrl] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (photo && photoIsObjectUrl) URL.revokeObjectURL(photo);
    };
  }, [photo, photoIsObjectUrl]);

  // Explicit trigger — the user uploads a photo, then presses the button.
  const run = useCallback(() => {
    if (!photo) return;
    setStatus("loading");
    setStep(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        window.clearInterval(id);
        window.setTimeout(() => setStatus("result"), 500);
      } else {
        setStep(i);
      }
    }, 800);
  }, [photo]);

  const setNewPhoto = useCallback(
    (src: string | null, isObjectUrl: boolean, result?: string | null) => {
      if (photo && photoIsObjectUrl) URL.revokeObjectURL(photo);
      setPhoto(src);
      // Mapped generated result (e.g. model1 → model1_) or the photo itself.
      setResultSrc(result ?? src);
      setPhotoIsObjectUrl(isObjectUrl);
      setStatus("idle"); // wait for the user to press the button
    },
    [photo, photoIsObjectUrl],
  );

  const onFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setNewPhoto(url, true, url);
    },
    [setNewPhoto],
  );

  const reset = () => {
    if (photo && photoIsObjectUrl) URL.revokeObjectURL(photo);
    setPhoto(null);
    setResultSrc(null);
    setPhotoIsObjectUrl(false);
    setStatus("idle");
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const download = () => {
    if (!resultSrc) return;
    const a = document.createElement("a");
    a.href = resultSrc;
    a.download = "xinthe-virtual-tryon.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Panel
      title="Virtual Try-On"
      icon={Shirt}
      badge={
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
          Beta
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 1. Product */}
        <div>
          <StepLabel n={1}>Product</StepLabel>
          <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-white", BOX)}>
            {product.image ? (
              <SmartImage src={product.image} styled={false} alt={product.label} fit="contain" />
            ) : (
              <ProductPlaceholder />
            )}
          </div>
        </div>

        {/* 2. Upload person photo */}
        <div>
          <StepLabel n={2}>Upload Person Photo</StepLabel>
          <button
            type="button"
            onClick={() => setExplorerOpen(true)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors",
              BOX,
              dragging
                ? "border-brand-500 bg-brand-50"
                : "border-line bg-surface-subtle hover:border-ink/25 hover:bg-white",
            )}
          >
            {photo ? (
              <span className="relative h-full w-full overflow-hidden rounded-2xl bg-surface-subtle">
                <SmartImage src={photo} styled={false} alt="Uploaded" fit="contain" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 text-[11px] font-medium text-white">
                  Click to change
                </span>
              </span>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white shadow-soft">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="mt-3 text-[13px] font-semibold text-ink">
                  Drop your photo here
                </span>
                <span className="mt-1 text-[11px] text-ink-faint">
                  or click to browse · JPG, PNG
                </span>
              </>
            )}
          </button>
        </div>

        {/* 3. Result */}
        <div>
          <StepLabel n={3}>Try-On Result</StepLabel>
          <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-white", BOX)}>
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={step}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-[13px] font-medium text-ink"
                    >
                      {STEPS[step]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ) : status === "result" ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-surface-subtle"
                >
                  <SmartImage src={resultSrc} styled alt="Try-on result" fit="contain" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white shadow-glow">
                    Demo Preview
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={photo ? "armed" : "idle"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-surface-subtle p-3"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-line text-center">
                    <span
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-full",
                        photo
                          ? "animate-float bg-brand-500 text-white shadow-glow"
                          : "bg-brand-50 text-brand-500",
                      )}
                    >
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <p className="text-[13px] font-semibold text-ink">
                      {photo ? "Ready to generate" : "Your preview appears here"}
                    </p>
                    <p className="max-w-[210px] text-[11.5px] leading-relaxed text-ink-muted">
                      {photo
                        ? "Press Virtual Try-On below to see it worn."
                        : "Upload a photo or pick a sample model to preview."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Action bar — centered */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {status === "result" ? (
            <>
              <button
                type="button"
                onClick={run}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition-colors hover:bg-surface-subtle"
              >
                <RotateCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-600"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <RefreshCw className="h-4 w-4" />
                Try another photo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={run}
              disabled={!photo || status === "loading"}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors",
                !photo || status === "loading"
                  ? "cursor-not-allowed bg-brand-500/40"
                  : "bg-brand-500 hover:bg-brand-600",
              )}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Virtual Try-On
                </>
              )}
            </button>
          )}
        </div>

        <p className="flex items-center gap-2 text-center text-[11.5px] leading-relaxed text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
          Mock try-on for UX only — no AI inference. Your photo stays in your browser.
        </p>
      </div>

      <FileExplorerModal
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        images={SAMPLE_PERSON_IMAGES}
        title="Select a person image"
        onPick={(img) =>
          // The baked result depends on the product being tried on
          // (red shirt → model1_, cap → model1__, …).
          setNewPhoto(img.src ?? null, false, img.results?.[product.id] ?? img.src ?? null)
        }
        onUploadFile={(file) => onFile(file)}
      />
    </Panel>
  );
}
