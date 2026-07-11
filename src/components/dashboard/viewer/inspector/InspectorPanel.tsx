"use client";

import {
  Activity,
  Camera,
  Globe2,
  Palette,
  Settings2,
  SunMedium,
} from "lucide-react";
import { Section } from "./controls";
import { LightingPanel } from "./LightingPanel";
import { EnvironmentControls } from "./EnvironmentControls";
import { CameraControlsPanel } from "./CameraControls";
import { MaterialInspector } from "./MaterialInspector";
import { RendererSettings } from "./RendererSettings";
import { PerformancePanel } from "./PerformancePanel";

/**
 * The pro studio inspector — collapsible sections in the classic DCC order.
 * Rendered below the quick lighting controls in the viewer's side rail.
 */
export function InspectorPanel() {
  return (
    <div className="space-y-2">
      <Section title="Lighting" icon={SunMedium} defaultOpen>
        <LightingPanel />
      </Section>
      <Section title="Environment" icon={Globe2}>
        <EnvironmentControls />
      </Section>
      <Section title="Camera" icon={Camera}>
        <CameraControlsPanel />
      </Section>
      <Section title="Material" icon={Palette}>
        <MaterialInspector />
      </Section>
      <Section title="Renderer" icon={Settings2}>
        <RendererSettings />
      </Section>
      <Section title="Performance" icon={Activity}>
        <PerformancePanel />
      </Section>
    </div>
  );
}
