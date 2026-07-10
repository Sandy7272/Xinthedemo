"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Images,
  ImagePlus,
  Image as ImageIcon,
  X,
  Check,
  LayoutGrid,
  Square,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { Panel } from "./ui/Panel";
import { FileExplorerModal } from "./ui/FileExplorerModal";
import { useStudio } from "./studio-context";
import { VIEW_ORDER, SAMPLE_PRODUCT_IMAGES } from "@/lib/easyvariants/config";
import type { UploadedView, ViewKey } from "@/lib/easyvariants/types";
import { cn } from "@/lib/cn";

export function UploadPanel() {
  const {
    uploadMode,
    setUploadMode,
    views,
    uploadedCount,
    addFile,
    setViewFromSample,
    removeView,
    clearViews,
  } = useStudio();

  // Which slot the file explorer is currently picking for.
  const [target, setTarget] = useState<ViewKey | null>(null);

  const openExplorer = (key: ViewKey) => setTarget(key);

  const loadSampleSet = () => {
    SAMPLE_PRODUCT_IMAGES.forEach((img) => {
      if (img.view) setViewFromSample(img.view, img);
    });
  };

  return (
    <Panel
      title="1. Upload Multi-View Images"
      description="Pick images from the library, then generate the 3D model."
      icon={Images}
      badge={
        <span className="rounded-full bg-[#12b76a]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0f9457]">
          {uploadedCount}/6 Uploaded
        </span>
      }
      actions={
        uploadedCount > 0 ? (
          <button
            type="button"
            onClick={clearViews}
            aria-label="Clear"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null
      }
    >
      {/* Mode switch */}
      <div className="mb-4 flex gap-1 rounded-2xl bg-surface-muted p-1">
        <ModeButton
          active={uploadMode === "single"}
          icon={Square}
          label="Single Image"
          onClick={() => setUploadMode("single")}
        />
        <ModeButton
          active={uploadMode === "multi"}
          icon={LayoutGrid}
          label="All Views"
          onClick={() => setUploadMode("multi")}
        />
      </div>

      {uploadMode === "single" ? (
        <SingleUpload
          view={views.front}
          onBrowse={() => openExplorer("front")}
          onRemove={() => removeView("front")}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {VIEW_ORDER.map(({ key, label }) => (
              <ViewSlot
                key={key}
                label={label}
                view={views[key]}
                onBrowse={() => openExplorer(key)}
                onRemove={() => removeView(key)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={loadSampleSet}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-subtle py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            <FolderOpen className="h-4 w-4 text-brand-500" />
            Load full 6-view sample set
          </button>
        </div>
      )}

      <p className="mt-3 flex items-center gap-2 text-[12px] text-ink-faint">
        <ImageIcon className="h-3.5 w-3.5" />
        {uploadMode === "single"
          ? "One clear product image is enough to start."
          : `${uploadedCount}/6 views added — more angles improve accuracy.`}
      </p>

      <FileExplorerModal
        open={target !== null}
        onClose={() => setTarget(null)}
        images={SAMPLE_PRODUCT_IMAGES}
        title={
          uploadMode === "single"
            ? "Select product image"
            : `Select ${target ?? ""} view`
        }
        onPick={(img) => target && setViewFromSample(target, img)}
        onUploadFile={(file) => target && addFile(target, file)}
      />
    </Panel>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Square;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="upload-mode"
          className="absolute inset-0 rounded-xl bg-white shadow-soft"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="relative h-4 w-4" />
      <span className="relative">{label}</span>
    </button>
  );
}

/** Renders a thumbnail with a graceful gradient fallback if the image fails. */
function Thumb({ view }: { view: UploadedView }) {
  const [failed, setFailed] = useState(false);
  if (view.url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={view.url}
        alt={view.name ?? view.key}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 35%, ${view.tint ?? "#eef4ff"} 0%, #ffffff 72%)`,
      }}
    >
      <ImageIcon className="h-7 w-7 text-brand-300" />
    </span>
  );
}

function SingleUpload({
  view,
  onBrowse,
  onRemove,
}: {
  view: UploadedView;
  onBrowse: () => void;
  onRemove: () => void;
}) {
  const filled = Boolean(view.url || view.sample);
  return filled ? (
    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-line">
      <Thumb view={view} />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
        <span className="text-[12px] font-medium text-white">
          {view.name ?? "product image"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white">
          <Check className="h-3.5 w-3.5" /> Ready
        </span>
      </div>
      <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onBrowse}
          className="rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-ink shadow-soft"
        >
          Change
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="grid h-6 w-6 place-items-center rounded-full bg-white/95 text-ink shadow-soft"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={onBrowse}
      className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface-subtle text-center transition-colors hover:border-ink/25 hover:bg-white"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-soft">
        <ImagePlus className="h-7 w-7" />
      </span>
      <span className="mt-4 text-sm font-semibold text-ink">
        Browse files
      </span>
      <span className="mt-1 text-[13px] text-ink-muted">
        Choose a product image to convert
      </span>
    </button>
  );
}

function ViewSlot({
  label,
  view,
  onBrowse,
  onRemove,
}: {
  label: string;
  view: UploadedView;
  onBrowse: () => void;
  onRemove: () => void;
}) {
  const filled = Boolean(view.url || view.sample);
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onBrowse}
        className={cn(
          "relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border text-center transition-all",
          filled
            ? "border-line"
            : "border-2 border-dashed border-line bg-surface-subtle hover:border-ink/25 hover:bg-white",
        )}
      >
        {filled ? (
          <Thumb view={view} />
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-ink-faint" />
            <span className="mt-1.5 text-[11px] font-medium text-ink-muted">
              {label}
            </span>
          </>
        )}
        {filled && (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
            <span className="text-[11px] font-medium text-white">{label}</span>
            <Check className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </button>
      {filled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
