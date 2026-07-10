"use client";

import { useState } from "react";
import { Download, FileJson, Loader2, Check, Package } from "lucide-react";
import { Panel } from "./ui/Panel";
import { useStudio } from "./studio-context";
import { EXPORT_FORMATS } from "@/lib/easyvariants/config";
import type { ExportFormat } from "@/lib/easyvariants/types";
import { cn } from "@/lib/cn";

// three-stdlib exporters are heavy — load them only when an export runs,
// keeping them out of the initial page bundle.
const loadExporters = () => import("@/lib/easyvariants/exporters");

type ExportState = "idle" | "busy" | "done" | "queued";

export function ExportPanel() {
  const { viewerRef, metadata, baseColor, fabricId, materialId, logoId, materials } =
    useStudio();
  const [states, setStates] = useState<Record<string, ExportState>>({});

  const setState = (id: string, s: ExportState) =>
    setStates((prev) => ({ ...prev, [id]: s }));

  const getModel = () => {
    const api = viewerRef.current;
    if (!api) return null;
    return api.scene.getObjectByName("EasyVariantsGarment") ?? api.scene;
  };

  const filename = (ext: string) =>
    `${metadata.brand || "easyvariants"}-${metadata.category}`
      .toLowerCase()
      .replace(/\s+/g, "-") + `.${ext}`;

  const handleExport = async (fmt: ExportFormat) => {
    if (!fmt.supported) {
      setState(fmt.id, "queued");
      setTimeout(() => setState(fmt.id, "idle"), 2400);
      return;
    }
    const model = getModel();
    if (!model) return;
    setState(fmt.id, "busy");
    try {
      const { exportGLB, exportOBJ, exportUSDZ, downloadBlob } =
        await loadExporters();
      let blob: Blob;
      if (fmt.id === "glb") blob = await exportGLB(model);
      else if (fmt.id === "obj") blob = exportOBJ(model);
      else if (fmt.id === "usdz") blob = await exportUSDZ(model);
      else return;
      downloadBlob(blob, filename(fmt.ext));
      setState(fmt.id, "done");
      setTimeout(() => setState(fmt.id, "idle"), 2000);
    } catch (err) {
      console.error("Export failed", err);
      setState(fmt.id, "idle");
    }
  };

  const handleMetadata = async () => {
    const { buildMetadataJson, downloadBlob } = await loadExporters();
    const json = buildMetadataJson(metadata, {
      variant: { baseColor, fabricId, materialId, logoId },
      render: materials,
    });
    downloadBlob(new Blob([json], { type: "application/json" }), filename("json"));
    setState("json", "done");
    setTimeout(() => setState("json", "idle"), 2000);
  };

  return (
    <Panel
      title="7. Export 3D Model"
      description="Download your 3D model in multiple formats."
      icon={Package}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {EXPORT_FORMATS.map((fmt) => {
          const state = states[fmt.id] ?? "idle";
          return (
            <button
              key={fmt.id}
              type="button"
              onClick={() => handleExport(fmt)}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                state === "done"
                  ? "border-[#12b76a]/40 bg-[#12b76a]/5"
                  : "border-line bg-white hover:border-ink/20 hover:shadow-soft",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-ink">
                  {fmt.label}
                </span>
                {state === "busy" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
                ) : state === "done" ? (
                  <Check className="h-4 w-4 text-[#12b76a]" />
                ) : (
                  <Download className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink" />
                )}
              </div>
              <span className="text-[11px] leading-tight text-ink-muted">
                {state === "queued" ? "Queued for processing…" : fmt.description}
              </span>
              {!fmt.supported && state !== "queued" && (
                <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
                  Server-side
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleMetadata}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-line bg-surface-subtle px-4 py-3 text-left transition-colors hover:bg-surface-muted"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink shadow-soft">
            <FileJson className="h-[18px] w-[18px]" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              Download Metadata JSON
            </span>
            <span className="block text-[12px] text-ink-muted">
              Dimensions, variant &amp; material configuration
            </span>
          </span>
        </span>
        {(states.json ?? "idle") === "done" ? (
          <Check className="h-5 w-5 text-[#12b76a]" />
        ) : (
          <Download className="h-5 w-5 text-ink-faint" />
        )}
      </button>
    </Panel>
  );
}
