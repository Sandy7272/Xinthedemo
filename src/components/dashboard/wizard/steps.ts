import { Images, ScanLine, Box, Palette, Shirt, type LucideIcon } from "lucide-react";

export type WizardStep = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

/**
 * The five screens of the guided studio flow. Each one is shown on its own —
 * the stepper across the top reflects progress and lets the user jump back.
 */
export const WIZARD_STEPS: WizardStep[] = [
  { id: "gallery", label: "Gallery", hint: "Choose a product image", icon: Images },
  { id: "reconstruct", label: "Reconstruct", hint: "Building the 3D mesh", icon: ScanLine },
  { id: "model", label: "3D Model", hint: "Inspect your model", icon: Box },
  { id: "variants", label: "Variants", hint: "Colour · fabric · logo", icon: Palette },
  { id: "tryon", label: "Try-On", hint: "See it on a model", icon: Shirt },
];

export const STEP_COUNT = WIZARD_STEPS.length;
