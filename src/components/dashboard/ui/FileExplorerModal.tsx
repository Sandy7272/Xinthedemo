"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Clock,
  HardDrive,
  Image as ImageIcon,
  Upload,
  Check,
} from "lucide-react";
import type { SampleImage } from "@/lib/easyvariants/config";
import { cn } from "@/lib/cn";

type FileExplorerModalProps = {
  open: boolean;
  onClose: () => void;
  images: SampleImage[];
  title?: string;
  onPick: (img: SampleImage) => void;
  onUploadFile?: (file: File) => void;
};

/**
 * In-app "file explorer" for selecting demo images — mimics an OS file
 * picker so the flow feels real without touching the device. Supports a
 * real device upload too.
 */
export function FileExplorerModal({
  open,
  onClose,
  images,
  title = "Select an image",
  onPick,
  onUploadFile,
}: FileExplorerModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(query.toLowerCase()),
  );
  const selectedImg = images.find((i) => i.id === selected);

  const confirm = (img?: SampleImage) => {
    const target = img ?? selectedImg;
    if (!target) return;
    onPick(target);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative flex h-[540px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-[18px] w-[18px] text-brand-500" />
                <span className="text-sm font-semibold text-ink">{title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-0.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint">
                  <ChevronLeft className="h-4 w-4" />
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-line bg-surface-subtle px-2.5 py-1.5 text-[13px] text-ink-muted">
                <HardDrive className="h-3.5 w-3.5" />
                <span>This PC</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-ink">Sample Products</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-ink-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-28 bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1">
              {/* sidebar */}
              <aside className="hidden w-44 shrink-0 border-r border-line p-2 sm:block">
                <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Quick access
                </p>
                {[
                  { label: "Sample Products", icon: FolderOpen, active: true },
                  { label: "Recent", icon: Clock },
                  { label: "This PC", icon: HardDrive },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
                        item.active
                          ? "bg-surface-muted text-ink"
                          : "text-ink-muted",
                      )}
                    >
                      <Icon className="h-4 w-4 text-ink-faint" />
                      {item.label}
                    </div>
                  );
                })}
              </aside>

              {/* grid */}
              <div className="min-w-0 flex-1 overflow-y-auto p-3">
                {filtered.length === 0 ? (
                  <div className="grid h-full place-items-center text-sm text-ink-faint">
                    No files match “{query}”.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {filtered.map((img) => (
                      <FileTile
                        key={img.id}
                        img={img}
                        selected={selected === img.id}
                        onSelect={() => setSelected(img.id)}
                        onOpen={() => confirm(img)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-line px-4 py-3">
              {onUploadFile && (
                <>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface-subtle"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from device
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onUploadFile(file);
                        onClose();
                      }
                    }}
                  />
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden max-w-[150px] truncate rounded-lg bg-surface-subtle px-2.5 py-2 text-[12px] text-ink-muted sm:block">
                  {selectedImg ? selectedImg.name : "No file selected"}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirm()}
                  disabled={!selectedImg}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Open
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FileTile({
  img,
  selected,
  onSelect,
  onOpen,
}: {
  img: SampleImage;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = img.src && !failed;

  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={cn(
        "group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all",
        selected
          ? "border-brand-500 bg-brand-50"
          : "border-transparent hover:bg-surface-subtle",
      )}
    >
      <span className="relative aspect-square w-full overflow-hidden rounded-lg border border-line bg-white">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.src}
            alt={img.name}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${img.tint} 0%, #ffffff 72%)`,
            }}
          >
            <ImageIcon className="h-6 w-6 text-brand-300" />
          </span>
        )}
        {selected && (
          <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white">
            <Check className="h-3 w-3" />
          </span>
        )}
      </span>
      <span className="w-full truncate text-center text-[11px] font-medium text-ink-soft">
        {img.name}
      </span>
    </button>
  );
}
