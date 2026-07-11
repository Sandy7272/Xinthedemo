"use client";

import { Slider } from "@/components/ui/Slider";
import { useStudio } from "../../studio-context";
import {
  QUALITY_PRESETS,
  TONE_MAPPING_OPTIONS,
  useViewerSettings,
  type QualityId,
} from "../viewer-settings-context";
import { SelectField, ToggleRow } from "./controls";

const QUALITY_OPTIONS = (
  Object.keys(QUALITY_PRESETS) as QualityId[]
).map((id) => ({ id, label: QUALITY_PRESETS[id].label }));

/**
 * Renderer-level controls: exposure, tone mapping curve, quality preset
 * (DPR / shadow map / MSAA / anisotropy) and the post-processing stack.
 */
export function RendererSettings() {
  const { materials, setMaterials } = useStudio();
  const { toneMapping, setToneMapping, quality, setQuality, effects, setEffect } =
    useViewerSettings();

  const q = QUALITY_PRESETS[quality];

  return (
    <>
      <Slider
        label="Exposure"
        value={materials.exposure}
        min={0.2}
        max={3}
        step={0.05}
        onChange={(v) => setMaterials({ exposure: v })}
        format={(v) => `${v.toFixed(2)} EV`}
      />

      <SelectField
        label="Tone mapping"
        value={toneMapping}
        options={TONE_MAPPING_OPTIONS}
        onChange={setToneMapping}
      />

      <SelectField
        label="Render quality"
        value={quality}
        options={QUALITY_OPTIONS}
        onChange={setQuality}
      />
      <p className="-mt-2 font-mono text-[11px] text-ink-faint">
        {q.dpr}× DPR · {q.shadowMapSize}px shadows ·{" "}
        {q.multisampling > 0 ? `${q.multisampling}× MSAA` : "no MSAA"} ·{" "}
        {q.anisotropy}× aniso
      </p>

      <div className="space-y-3 rounded-xl border border-line bg-surface-subtle p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          Post-processing
        </p>
        <ToggleRow
          label="Bloom"
          hint="Soft glow on bright highlights"
          checked={effects.bloom}
          onChange={(on) => setEffect("bloom", on)}
        />
        <ToggleRow
          label="SSAO"
          hint="Ambient occlusion (N8AO)"
          checked={effects.ssao}
          onChange={(on) => setEffect("ssao", on)}
        />
        <ToggleRow
          label="Vignette"
          hint="Darkened frame edges"
          checked={effects.vignette}
          onChange={(on) => setEffect("vignette", on)}
        />
        <ToggleRow
          label="FXAA"
          hint="Fast approximate anti-aliasing"
          checked={effects.fxaa}
          onChange={(on) => setEffect("fxaa", on)}
        />
      </div>
    </>
  );
}
