"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { useStudio } from "../../studio-context";
import { useViewerSettings } from "../viewer-settings-context";
import { MiniButton } from "./controls";

const x100 = (v: number) => `${Math.round(v * 100)}%`;

/**
 * Live PBR material editor for the loaded model. Metalness / roughness /
 * env intensity reuse the existing studio material state (so fabric presets
 * stay in sync); the physical extensions (clearcoat, transmission, IOR…)
 * ride the upgraded MeshPhysicalMaterial applied in GarmentModel.
 */
export function MaterialInspector() {
  const { materials, setMaterials } = useStudio();
  const { physical, setPhysical, resetPhysical } = useViewerSettings();

  return (
    <>
      <Slider
        label="Metalness"
        value={materials.metalness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setMaterials({ metalness: v })}
        format={x100}
      />
      <Slider
        label="Roughness"
        value={materials.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setMaterials({ roughness: v })}
        format={x100}
      />
      <Slider
        label="Environment intensity"
        value={materials.envIntensity}
        min={0}
        max={3}
        step={0.05}
        onChange={(v) => setMaterials({ envIntensity: v })}
        format={x100}
      />

      <div className="border-t border-line pt-3" />

      <Slider
        label="Clearcoat"
        value={physical.clearcoat}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setPhysical({ clearcoat: v })}
        format={x100}
      />
      <Slider
        label="Clearcoat roughness"
        value={physical.clearcoatRoughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setPhysical({ clearcoatRoughness: v })}
        format={x100}
      />
      <Slider
        label="Transmission (glass)"
        value={physical.transmission}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setPhysical({ transmission: v })}
        format={x100}
      />
      <Slider
        label="IOR"
        value={physical.ior}
        min={1}
        max={2.33}
        step={0.01}
        onChange={(v) => setPhysical({ ior: v })}
        format={(v) => v.toFixed(2)}
      />
      <Slider
        label="Opacity"
        value={physical.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setPhysical({ opacity: v })}
        format={x100}
      />
      <Slider
        label="Normal scale"
        value={physical.normalScale}
        min={0}
        max={3}
        step={0.05}
        onChange={(v) => setPhysical({ normalScale: v })}
        format={(v) => `${v.toFixed(2)}×`}
      />

      <MiniButton
        onClick={() => {
          resetPhysical();
          // Reset only the PBR trio here — exposure belongs to the renderer.
          setMaterials({ roughness: 0.8, metalness: 0, envIntensity: 1 });
        }}
        icon={RotateCcw}
        className="w-full"
      >
        Reset material
      </MiniButton>
    </>
  );
}
