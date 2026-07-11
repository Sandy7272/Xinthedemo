"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import { useStudio, type LightDirection } from "../../studio-context";
import { useViewerSettings } from "../viewer-settings-context";
import { ColorField, ControlBlock, MiniButton } from "./controls";

const x100 = (v: number) => `${Math.round(v * 100)}%`;

const DIRECTIONS: { id: LightDirection; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "top", label: "Top" },
  { id: "right", label: "Right" },
];

/**
 * Per-light rig controls + shadow settings. The key (directional) light
 * multiplies the environment preset; its position picker drives the shared
 * studio lighting direction (key light + matching softbox reflection).
 */
export function LightingPanel() {
  const { lighting, setLighting, resetLighting } = useStudio();
  const { lights, setLight, resetLights, shadows, setShadows } =
    useViewerSettings();

  return (
    <>
      <ControlBlock
        title="Directional (key)"
        enabled={lights.directional.enabled}
        onToggle={(on) => setLight("directional", { enabled: on })}
      >
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink-soft">Position</p>
          <div className="grid grid-cols-3 gap-1.5">
            {DIRECTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={lighting.direction === d.id}
                onClick={() => setLighting({ direction: d.id })}
                className={cn(
                  "rounded-lg border px-1 py-1.5 text-[12px] font-medium transition-colors",
                  lighting.direction === d.id
                    ? "border-brand-500 bg-brand-50/60 text-ink"
                    : "border-line bg-white text-ink-muted hover:text-ink",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <Slider
          label="Intensity"
          value={lights.directional.intensity}
          min={0}
          max={4}
          step={0.05}
          onChange={(v) => setLight("directional", { intensity: v })}
          format={x100}
        />
        <ColorField
          label="Color"
          value={lights.directional.color}
          onChange={(c) => setLight("directional", { color: c })}
        />
      </ControlBlock>

      <ControlBlock
        title="Top light"
        enabled={lights.top.enabled}
        onToggle={(on) => setLight("top", { enabled: on })}
      >
        <Slider
          label="Intensity"
          value={lights.top.intensity}
          min={0}
          max={4}
          step={0.05}
          onChange={(v) => setLight("top", { intensity: v })}
          format={x100}
        />
        <Slider
          label="Height"
          value={lights.top.height}
          min={2}
          max={12}
          step={0.1}
          onChange={(v) => setLight("top", { height: v })}
          format={(v) => `${v.toFixed(1)}m`}
        />
      </ControlBlock>

      <ControlBlock
        title="Back light (rim)"
        enabled={lights.back.enabled}
        onToggle={(on) => setLight("back", { enabled: on })}
      >
        <Slider
          label="Intensity"
          value={lights.back.intensity}
          min={0}
          max={4}
          step={0.05}
          onChange={(v) => setLight("back", { intensity: v })}
          format={x100}
        />
      </ControlBlock>

      <ControlBlock
        title="Fill light"
        enabled={lights.fill.enabled}
        onToggle={(on) => setLight("fill", { enabled: on })}
      >
        <Slider
          label="Intensity"
          value={lights.fill.intensity}
          min={0}
          max={4}
          step={0.05}
          onChange={(v) => setLight("fill", { intensity: v })}
          format={x100}
        />
      </ControlBlock>

      <ControlBlock
        title="Ambient light"
        enabled={lights.ambient.enabled}
        onToggle={(on) => setLight("ambient", { enabled: on })}
      >
        <Slider
          label="Intensity"
          value={lights.ambient.intensity}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => setLight("ambient", { intensity: v })}
          format={x100}
        />
      </ControlBlock>

      <ControlBlock
        title="Shadows"
        enabled={shadows.enabled}
        onToggle={(on) => setShadows({ enabled: on })}
      >
        <Slider
          label="Strength"
          value={shadows.strength}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => setShadows({ strength: v })}
          format={x100}
        />
        <Slider
          label="Blur"
          value={shadows.blur}
          min={0}
          max={6}
          step={0.1}
          onChange={(v) => setShadows({ blur: v })}
          format={(v) => v.toFixed(1)}
        />
        <Slider
          label="Opacity"
          value={shadows.opacity}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setShadows({ opacity: v })}
          format={x100}
        />
        <Slider
          label="Bias"
          value={shadows.bias}
          min={-0.005}
          max={0.005}
          step={0.0001}
          onChange={(v) => setShadows({ bias: v })}
          format={(v) => v.toFixed(4)}
        />
      </ControlBlock>

      <MiniButton
        onClick={() => {
          resetLights();
          resetLighting(); // also restores the key-light direction (top)
        }}
        icon={RotateCcw}
        className="w-full"
      >
        Reset lights &amp; shadows
      </MiniButton>
    </>
  );
}
