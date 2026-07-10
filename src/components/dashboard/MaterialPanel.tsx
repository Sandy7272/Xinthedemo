"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Panel } from "./ui/Panel";
import { Slider } from "@/components/ui/Slider";
import { useStudio } from "./studio-context";

export function MaterialPanel() {
  const { materials, setMaterials, resetMaterials } = useStudio();

  return (
    <Panel
      title="4. Material & Render"
      description="Fine-tune PBR properties in real time."
      icon={SlidersHorizontal}
    >
      <div className="space-y-5">
        <Slider
          label="Roughness"
          value={materials.roughness}
          onChange={(v) => setMaterials({ roughness: v })}
        />
        <Slider
          label="Metalness"
          value={materials.metalness}
          onChange={(v) => setMaterials({ metalness: v })}
        />
        <Slider
          label="Environment"
          value={materials.envIntensity}
          min={0}
          max={3}
          step={0.05}
          onChange={(v) => setMaterials({ envIntensity: v })}
        />
        <Slider
          label="Exposure"
          value={materials.exposure}
          min={0.4}
          max={2}
          step={0.01}
          onChange={(v) => setMaterials({ exposure: v })}
          format={(v) => `${v.toFixed(2)}`}
        />
      </div>

      <button
        type="button"
        onClick={resetMaterials}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-subtle py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
      >
        <RotateCcw className="h-4 w-4" />
        Reset All
      </button>
    </Panel>
  );
}
