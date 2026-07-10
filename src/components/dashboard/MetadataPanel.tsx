"use client";

import { useState } from "react";
import { FileText, Wand2, Loader2, RefreshCw, Pencil, Check } from "lucide-react";
import { Panel } from "./ui/Panel";
import { Button } from "@/components/ui/Button";
import { useStudio } from "./studio-context";
import { METADATA_FIELDS } from "@/lib/easyvariants/config";
import type { ProductMetadata } from "@/lib/easyvariants/types";
import { cn } from "@/lib/cn";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink shadow-soft transition-colors focus:border-brand-400 focus:outline-none";

export function MetadataPanel() {
  const { metadata, setField, status, generate, uploadedCount } = useStudio();
  const [editing, setEditing] = useState(false);
  const disabled = uploadedCount === 0;

  return (
    <Panel
      title="2. Product Metadata"
      description="Real-world dimensions guide geometry and scale."
      icon={FileText}
      actions={
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            editing
              ? "bg-ink text-white"
              : "text-ink-muted hover:bg-surface-muted hover:text-ink",
          )}
        >
          {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? "Done" : "Edit"}
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-4">
        {METADATA_FIELDS.map((field) => {
          const value = metadata[field.key];
          return (
            <div key={field.key} className="min-w-0">
              <p className="text-[11px] font-medium text-ink-faint">
                {field.label}
              </p>
              {editing ? (
                field.type === "select" ? (
                  <select
                    value={value}
                    onChange={(e) =>
                      setField(field.key as keyof ProductMetadata, e.target.value)
                    }
                    className={cn(inputClass, "mt-1 cursor-pointer appearance-none")}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    value={value}
                    onChange={(e) =>
                      setField(field.key as keyof ProductMetadata, e.target.value)
                    }
                    className={cn(inputClass, "mt-1")}
                  />
                )
              ) : (
                <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">
                  {value}
                  {field.unit ? (
                    <span className="ml-0.5 text-[12px] font-normal text-ink-muted">
                      {field.unit}
                    </span>
                  ) : null}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <Button
          onClick={generate}
          disabled={disabled || status === "generating"}
          className="w-full"
          leftIcon={
            status === "generating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "ready" ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )
          }
        >
          {status === "generating"
            ? "Generating…"
            : status === "ready"
              ? "Update & Regenerate 3D"
              : "Update & Generate 3D"}
        </Button>
        {disabled && (
          <p className="mt-2 text-center text-[12px] text-ink-faint">
            Add at least one product image to generate.
          </p>
        )}
      </div>
    </Panel>
  );
}
