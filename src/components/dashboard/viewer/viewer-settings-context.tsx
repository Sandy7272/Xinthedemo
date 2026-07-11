"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

/**
 * ─────────────────────────────────────────────────────────────
 *  VIEWER SETTINGS — single source of truth for the pro viewer
 * ─────────────────────────────────────────────────────────────
 *  Everything the studio inspector controls lives here: HDRI
 *  rotation, tone mapping, the 5-light rig, shadows, physical
 *  material overrides, background, render quality and the post
 *  stack. The provider sits next to StudioProvider so settings
 *  survive wizard step changes.
 *
 *  Note: three r155+ is always physically correct (the old
 *  `physicallyCorrectLights` flag is the default and was removed),
 *  so all intensities below are physical units/multipliers.
 * ─────────────────────────────────────────────────────────────
 */

// ── Tone mapping ────────────────────────────────────────────
export type ToneMappingId = "aces" | "reinhard" | "cineon" | "neutral" | "none";

export const TONE_MAPPING_OPTIONS: { id: ToneMappingId; label: string }[] = [
  { id: "aces", label: "ACES Filmic" },
  { id: "reinhard", label: "Reinhard" },
  { id: "cineon", label: "Cineon" },
  { id: "neutral", label: "Neutral" },
  { id: "none", label: "None (Linear)" },
];

// ── Background ──────────────────────────────────────────────
export type BackgroundId =
  | "studio"
  | "transparent"
  | "white"
  | "black"
  | "gray"
  | "gradient"
  | "hdr";

export const BACKGROUND_OPTIONS: { id: BackgroundId; label: string }[] = [
  { id: "studio", label: "Studio (preset)" },
  { id: "transparent", label: "Transparent" },
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
  { id: "gray", label: "Studio Gray" },
  { id: "gradient", label: "Gradient" },
  { id: "hdr", label: "HDR Only" },
];

// ── Light rig ───────────────────────────────────────────────
export type LightsSettings = {
  /** Key light. Follows the direction picker; intensity multiplies the preset. */
  directional: { enabled: boolean; intensity: number; color: string };
  /** Overhead accent light with adjustable height. */
  top: { enabled: boolean; intensity: number; height: number };
  /** Rim/back light separating the model from the background. */
  back: { enabled: boolean; intensity: number };
  /** Soft fill opposite the key light. */
  fill: { enabled: boolean; intensity: number };
  /** Global ambient term. */
  ambient: { enabled: boolean; intensity: number };
};

/** Top/back/fill default OFF so the stock look is pixel-identical. */
export const DEFAULT_LIGHTS: LightsSettings = {
  directional: { enabled: true, intensity: 1, color: "#ffffff" },
  top: { enabled: false, intensity: 1.2, height: 6 },
  back: { enabled: false, intensity: 1.4 },
  fill: { enabled: false, intensity: 0.8 },
  ambient: { enabled: true, intensity: 1 },
};

// ── Shadows ─────────────────────────────────────────────────
export type ShadowSettings = {
  enabled: boolean;
  /** Shadow-map darkness (light.shadow.intensity, 0–2). */
  strength: number;
  /** Contact-shadow blur radius. */
  blur: number;
  /** Contact-shadow opacity. */
  opacity: number;
  /** Shadow-map depth bias — tweak to fix acne/peter-panning. */
  bias: number;
};

/** Defaults mirror the previous hard-coded ContactShadows/light values. */
export const DEFAULT_SHADOWS: ShadowSettings = {
  enabled: true,
  strength: 1,
  blur: 2.6,
  opacity: 0.4,
  bias: -0.0002,
};

// ── Physical material overrides ─────────────────────────────
export type PhysicalSettings = {
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  ior: number;
  opacity: number;
  /** Multiplier on the model's authored normal-map scale. */
  normalScale: number;
};

export const DEFAULT_PHYSICAL: PhysicalSettings = {
  clearcoat: 0,
  clearcoatRoughness: 0.2,
  transmission: 0,
  ior: 1.5,
  opacity: 1,
  normalScale: 1,
};

// ── Post-processing ─────────────────────────────────────────
export type EffectsSettings = {
  bloom: boolean;
  vignette: boolean;
  fxaa: boolean;
  ssao: boolean;
};

/** Bloom + SSAO on by default — matches the previous always-on stack. */
export const DEFAULT_EFFECTS: EffectsSettings = {
  bloom: true,
  vignette: false,
  fxaa: false,
  ssao: true,
};

// ── Render quality ──────────────────────────────────────────
export type QualityId = "low" | "medium" | "high" | "ultra";

export type QualityConfig = {
  label: string;
  dpr: number;
  shadowMapSize: number;
  /** MSAA samples for the post-processing composer. */
  multisampling: number;
  anisotropy: number;
};

export const QUALITY_PRESETS: Record<QualityId, QualityConfig> = {
  low: { label: "Low", dpr: 1, shadowMapSize: 512, multisampling: 0, anisotropy: 1 },
  medium: { label: "Medium", dpr: 1.25, shadowMapSize: 1024, multisampling: 4, anisotropy: 2 },
  high: { label: "High", dpr: 1.75, shadowMapSize: 2048, multisampling: 4, anisotropy: 8 },
  ultra: { label: "Ultra", dpr: 2, shadowMapSize: 4096, multisampling: 8, anisotropy: 16 },
};

// ── Camera ──────────────────────────────────────────────────
export type CameraViewId =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "iso";

/** Imperative camera API registered by CameraRig (it lives inside the Canvas). */
export type CameraApi = {
  setView: (view: CameraViewId) => void;
  /** Frame the model in view, keeping the current angle. */
  fit: () => void;
  /** Fly back to the initial camera pose. */
  reset: () => void;
};

// ── Performance stats ───────────────────────────────────────
export type PerfStats = {
  fps: number;
  triangles: number;
  calls: number;
  geometries: number;
  textures: number;
  /** JS heap in MB — Chrome only, null elsewhere. */
  memoryMB: number | null;
  // internal accumulators for the tracker
  frames: number;
  last: number;
};

export const createPerfStats = (): PerfStats => ({
  fps: 0,
  triangles: 0,
  calls: 0,
  geometries: 0,
  textures: 0,
  memoryMB: null,
  frames: 0,
  last: 0,
});

// ── Context value ───────────────────────────────────────────
type ViewerSettingsValue = {
  // environment
  envRotation: number; // degrees, 0–360
  setEnvRotation: (deg: number) => void;
  background: BackgroundId;
  setBackground: (bg: BackgroundId) => void;
  // renderer
  toneMapping: ToneMappingId;
  setToneMapping: (t: ToneMappingId) => void;
  quality: QualityId;
  setQuality: (q: QualityId) => void;
  dpr: number;
  setDpr: (dpr: number) => void;
  // lights
  lights: LightsSettings;
  setLight: <K extends keyof LightsSettings>(
    key: K,
    patch: Partial<LightsSettings[K]>,
  ) => void;
  resetLights: () => void;
  // shadows
  shadows: ShadowSettings;
  setShadows: (patch: Partial<ShadowSettings>) => void;
  // material
  physical: PhysicalSettings;
  setPhysical: (patch: Partial<PhysicalSettings>) => void;
  resetPhysical: () => void;
  // post
  effects: EffectsSettings;
  setEffect: (key: keyof EffectsSettings, on: boolean) => void;
  // performance
  showPerf: boolean;
  setShowPerf: (on: boolean) => void;
  perfRef: MutableRefObject<PerfStats>;
  // camera (registered from inside the Canvas)
  cameraApiRef: MutableRefObject<CameraApi | null>;
};

const ViewerSettingsContext = createContext<ViewerSettingsValue | null>(null);

export function ViewerSettingsProvider({ children }: { children: ReactNode }) {
  const [envRotation, setEnvRotation] = useState(0);
  const [background, setBackground] = useState<BackgroundId>("studio");
  const [toneMapping, setToneMapping] = useState<ToneMappingId>("aces");
  const [quality, setQualityState] = useState<QualityId>("medium");
  const [dpr, setDpr] = useState(QUALITY_PRESETS.medium.dpr);
  const [lights, setLights] = useState<LightsSettings>(DEFAULT_LIGHTS);
  const [shadows, setShadowsState] = useState<ShadowSettings>(DEFAULT_SHADOWS);
  const [physical, setPhysicalState] = useState<PhysicalSettings>(DEFAULT_PHYSICAL);
  const [effects, setEffects] = useState<EffectsSettings>(DEFAULT_EFFECTS);
  const [showPerf, setShowPerf] = useState(false);

  const perfRef = useRef<PerfStats>(createPerfStats());
  const cameraApiRef = useRef<CameraApi | null>(null);

  const setQuality = useCallback((q: QualityId) => {
    setQualityState(q);
    setDpr(QUALITY_PRESETS[q].dpr);
  }, []);

  const setLight = useCallback(
    <K extends keyof LightsSettings>(key: K, patch: Partial<LightsSettings[K]>) =>
      setLights((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })),
    [],
  );
  const resetLights = useCallback(() => {
    setLights(DEFAULT_LIGHTS);
    setShadowsState(DEFAULT_SHADOWS);
  }, []);

  const setShadows = useCallback(
    (patch: Partial<ShadowSettings>) =>
      setShadowsState((prev) => ({ ...prev, ...patch })),
    [],
  );

  const setPhysical = useCallback(
    (patch: Partial<PhysicalSettings>) =>
      setPhysicalState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetPhysical = useCallback(() => setPhysicalState(DEFAULT_PHYSICAL), []);

  const setEffect = useCallback(
    (key: keyof EffectsSettings, on: boolean) =>
      setEffects((prev) => ({ ...prev, [key]: on })),
    [],
  );

  const value = useMemo<ViewerSettingsValue>(
    () => ({
      envRotation,
      setEnvRotation,
      background,
      setBackground,
      toneMapping,
      setToneMapping,
      quality,
      setQuality,
      dpr,
      setDpr,
      lights,
      setLight,
      resetLights,
      shadows,
      setShadows,
      physical,
      setPhysical,
      resetPhysical,
      effects,
      setEffect,
      showPerf,
      setShowPerf,
      perfRef,
      cameraApiRef,
    }),
    [
      envRotation,
      background,
      toneMapping,
      quality,
      setQuality,
      dpr,
      lights,
      setLight,
      resetLights,
      shadows,
      setShadows,
      physical,
      setPhysical,
      resetPhysical,
      effects,
      setEffect,
      showPerf,
    ],
  );

  return (
    <ViewerSettingsContext.Provider value={value}>
      {children}
    </ViewerSettingsContext.Provider>
  );
}

export function useViewerSettings() {
  const ctx = useContext(ViewerSettingsContext);
  if (!ctx)
    throw new Error("useViewerSettings must be used within ViewerSettingsProvider");
  return ctx;
}
