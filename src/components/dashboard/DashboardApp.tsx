"use client";

import { StudioProvider } from "./studio-context";
import { ViewerSettingsProvider } from "./viewer/viewer-settings-context";
import { WizardProvider } from "./wizard/wizard-context";
import { StudioWizard } from "./wizard/StudioWizard";

/**
 * The studio is a guided, single-screen-at-a-time flow:
 *   Gallery → Reconstruct → 3D Model → Variants → Try-On
 * StudioProvider holds the shared 3D / generation state; ViewerSettingsProvider
 * holds the pro-viewer inspector state (lighting rig, tone mapping, quality…)
 * so tweaks survive step changes; WizardProvider drives which screen is visible.
 */
export function DashboardApp() {
  return (
    <StudioProvider>
      <ViewerSettingsProvider>
        <WizardProvider>
          <StudioWizard />
        </WizardProvider>
      </ViewerSettingsProvider>
    </StudioProvider>
  );
}
