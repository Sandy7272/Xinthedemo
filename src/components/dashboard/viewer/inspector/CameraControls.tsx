"use client";

import { Crosshair, Scan } from "lucide-react";
import {
  useViewerSettings,
  type CameraViewId,
} from "../viewer-settings-context";
import { MiniButton } from "./controls";

const VIEWS: { id: CameraViewId; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "iso", label: "Iso" },
];

/**
 * Preset camera angles. Buttons call the imperative API that CameraRig
 * registers from inside the Canvas — each view tweens smoothly and frames
 * the model's live bounding sphere.
 */
export function CameraControlsPanel() {
  const { cameraApiRef } = useViewerSettings();
  const api = () => cameraApiRef.current;

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => api()?.setView(v.id)}
            className="rounded-lg border border-line bg-surface-subtle px-1 py-2 text-[12px] font-medium text-ink-soft transition-colors hover:border-brand-300 hover:bg-white hover:text-ink"
          >
            {v.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => api()?.fit()}
          title="Frame the model in view"
          className="rounded-lg border border-brand-200 bg-brand-50/60 px-1 py-2 text-[12px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
        >
          Fit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniButton onClick={() => api()?.fit()} icon={Scan}>
          Fit model
        </MiniButton>
        <MiniButton onClick={() => api()?.reset()} icon={Crosshair}>
          Reset camera
        </MiniButton>
      </div>
    </>
  );
}
