"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import {
  BACKGROUND_OPTIONS,
  useViewerSettings,
} from "../viewer-settings-context";
import { MiniButton, SelectField } from "./controls";

/**
 * HDRI orientation + backdrop. Rotation spins only the environment map
 * (lighting + reflections) — the model and camera stay untouched, matching
 * how Sketchfab/Apple viewers treat environment rotation.
 */
export function EnvironmentControls() {
  const { envRotation, setEnvRotation, background, setBackground } =
    useViewerSettings();

  return (
    <>
      <Slider
        label="HDRI rotation"
        value={envRotation}
        min={0}
        max={360}
        step={1}
        onChange={setEnvRotation}
        format={(v) => `${Math.round(v)}°`}
      />
      <MiniButton
        onClick={() => setEnvRotation(0)}
        icon={RotateCcw}
        className="w-full"
      >
        Reset rotation
      </MiniButton>

      <SelectField
        label="Background"
        value={background}
        options={BACKGROUND_OPTIONS}
        onChange={setBackground}
      />
      <p className="text-[11px] leading-relaxed text-ink-faint">
        Reflections always come from the HDRI, whatever the backdrop.
        Transparent keeps alpha in screenshots.
      </p>
    </>
  );
}
