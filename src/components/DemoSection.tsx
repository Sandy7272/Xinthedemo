"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PROCESSING_STEPS } from "@/lib/data";
import { easeOutExpo, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/cn";
import {
  IconUpload,
  IconImage,
  IconClose,
  IconSparkles,
  IconCheck,
  IconReset,
  IconCube,
} from "@/components/ui/icons";

// Lazy-load the WebGL viewer: heavy Three.js bundle is only fetched
// once the user reaches the "ready" state. No SSR (needs the DOM/WebGL).
const ModelViewer = dynamic(() => import("./viewer/ModelViewer"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

type UploadItem = {
  id: string;
  label: string;
  url?: string; // object URL for real uploads
  sample?: boolean;
};

const VIEW_SLOTS = ["Front", "Back", "Left", "Right", "Top"];
const SAMPLE_TINTS = ["#eef4ff", "#f0f7f2", "#fdf2f2", "#f5f0fb", "#eef7fb"];

type Status = "idle" | "processing" | "ready";

export function DemoSection() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      items.forEach((it) => it.url && URL.revokeObjectURL(it.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!imageFiles.length) return;
    setItems((prev) => {
      const next = [...prev];
      imageFiles.forEach((file, i) => {
        next.push({
          id: `${Date.now()}-${i}-${file.name}`,
          label: VIEW_SLOTS[next.length % VIEW_SLOTS.length],
          url: URL.createObjectURL(file),
        });
      });
      return next.slice(0, 8);
    });
  }, []);

  const loadSamples = useCallback(() => {
    setItems(
      VIEW_SLOTS.map((label, i) => ({
        id: `sample-${i}`,
        label,
        sample: true,
      })),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  // Drive the processing animation.
  const startProcessing = useCallback(() => {
    setStatus("processing");
    setProgress(0);
    const duration = 5200; // ms across all steps
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setStatus("ready"), 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = useCallback(() => {
    items.forEach((it) => it.url && URL.revokeObjectURL(it.url));
    setItems([]);
    setStatus("idle");
    setProgress(0);
  }, [items]);

  const hasImages = items.length > 0;
  const activeStep = Math.min(
    PROCESSING_STEPS.length - 1,
    Math.floor((progress / 100) * PROCESSING_STEPS.length),
  );

  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-brand-50/60 blur-[130px]" />
      </div>

      <div className="container-page">
        <SectionHeading
          eyebrow="Live demo"
          title="Interactive Image-to-3D Demo"
          description="Drag and drop your product images to see the full generation experience — geometry, textures, mesh optimization, and an interactive viewer."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mx-auto mt-12 max-w-5xl rounded-4xl border border-line bg-white/70 p-3 shadow-card backdrop-blur-sm sm:p-4"
        >
          <div className="rounded-3xl bg-surface-subtle p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: easeOutExpo }}
                >
                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onDrop}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                      dragActive
                        ? "border-brand-500 bg-brand-50/60"
                        : "border-line bg-white",
                    )}
                  >
                    <motion.div
                      animate={{ y: dragActive ? -4 : 0 }}
                      className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-soft"
                    >
                      <IconUpload className="h-7 w-7" />
                    </motion.div>
                    <h3 className="mt-5 text-lg font-semibold text-ink">
                      Drag & drop your product images
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm text-ink-muted">
                      Upload front, back, left, right and top views. PNG or JPG,
                      up to 8 images.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        leftIcon={<IconImage className="h-4 w-4" />}
                      >
                        Browse Images
                      </Button>
                      <button
                        type="button"
                        onClick={loadSamples}
                        className="text-sm font-medium text-brand-600 underline-offset-4 transition hover:underline"
                      >
                        Try with sample set
                      </button>
                    </div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && addFiles(e.target.files)
                      }
                    />
                  </div>

                  {/* View slots / uploaded thumbnails */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {VIEW_SLOTS.map((slot, i) => {
                      const item = items[i];
                      return (
                        <UploadSlot
                          key={slot}
                          label={slot}
                          item={item}
                          tint={SAMPLE_TINTS[i]}
                          onRemove={item ? () => removeItem(item.id) : undefined}
                        />
                      );
                    })}
                  </div>

                  {/* Generate CTA */}
                  <AnimatePresence>
                    {hasImages && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">
                          <div className="flex items-center gap-2 text-sm text-ink-muted">
                            <IconCheck className="h-4 w-4 text-[#12b76a]" />
                            {items.length} image
                            {items.length > 1 ? "s" : ""} ready for
                            reconstruction
                          </div>
                          <Button
                            onClick={startProcessing}
                            leftIcon={<IconSparkles className="h-4 w-4" />}
                          >
                            Generate 3D Model
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {status === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6"
                >
                  <ProcessingView
                    progress={progress}
                    activeStep={activeStep}
                    items={items}
                  />
                </motion.div>
              )}

              {status === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOutExpo }}
                >
                  <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12b76a]/10 px-2.5 py-1 text-xs font-medium text-[#0f9457]">
                        <IconCheck className="h-3.5 w-3.5" />
                        Generation complete
                      </span>
                      <span className="text-sm text-ink-muted">
                        Your interactive 3D model is ready.
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={reset}
                      leftIcon={<IconReset className="h-4 w-4" />}
                    >
                      Start over
                    </Button>
                  </div>
                  <ModelViewer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function UploadSlot({
  label,
  item,
  tint,
  onRemove,
}: {
  label: string;
  item?: UploadItem;
  tint: string;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-white">
      {item ? (
        <>
          {item.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={`${label} view`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${tint} 0%, #ffffff 70%)`,
              }}
            >
              <IconImage className="h-7 w-7 text-brand-300" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/45 to-transparent px-2 py-1.5">
            <span className="text-[11px] font-medium text-white">{label}</span>
            <IconCheck className="h-3.5 w-3.5 text-white" />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-faint">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-dashed border-line">
            <IconImage className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

function ProcessingView({
  progress,
  activeStep,
  items,
}: {
  progress: number;
  activeStep: number;
  items: UploadItem[];
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#0a0a0b"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <IconCube className="h-7 w-7 text-ink" />
          </motion.div>
        </div>
        <p className="mt-4 font-mono text-sm tabular-nums text-ink-muted">
          {Math.round(progress)}%
        </p>
        <h3 className="mt-1 text-lg font-semibold text-ink">
          Reconstructing your model
        </h3>

        {/* Tiny preview of the images being processed */}
        {items.length > 0 && (
          <div className="mt-4 flex -space-x-2">
            {items.slice(0, 5).map((it, i) => (
              <div
                key={it.id}
                className="h-8 w-8 overflow-hidden rounded-lg border-2 border-white bg-surface-muted"
              >
                {it.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: SAMPLE_TINTS[i] }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="mt-8 space-y-3">
        {PROCESSING_STEPS.map((step, i) => {
          const state =
            i < activeStep ? "done" : i === activeStep ? "active" : "pending";
          const stepStart = (i / PROCESSING_STEPS.length) * 100;
          const stepFill = Math.max(
            0,
            Math.min(
              100,
              ((progress - stepStart) / (100 / PROCESSING_STEPS.length)) * 100,
            ),
          );
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition-colors",
                  state === "done" &&
                    "border-transparent bg-ink text-white",
                  state === "active" &&
                    "border-ink text-ink",
                  state === "pending" &&
                    "border-line text-ink-faint",
                )}
              >
                {state === "done" ? (
                  <IconCheck className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      state === "pending" ? "text-ink-faint" : "text-ink",
                    )}
                  >
                    {step}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    className="h-full rounded-full bg-ink"
                    animate={{ width: `${stepFill}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ViewerSkeleton() {
  return (
    <div className="grid h-[420px] place-items-center rounded-3xl border border-line bg-surface-subtle sm:h-[520px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
        <span className="text-sm text-ink-muted">Loading 3D viewer…</span>
      </div>
    </div>
  );
}
