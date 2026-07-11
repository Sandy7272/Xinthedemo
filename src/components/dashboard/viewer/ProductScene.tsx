"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Center, Environment, Lightformer } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  N8AO,
  ToneMapping,
  Vignette,
  FXAA,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { GarmentModel, type GarmentProps } from "./GarmentModel";
import type { Lighting, LightDirection } from "../studio-context";
import type {
  BackgroundId,
  EffectsSettings,
  LightsSettings,
  ShadowSettings,
  ToneMappingId,
} from "./viewer-settings-context";

/** A lighting environment — drives background, lights and the studio softboxes. */
export type EnvPreset = {
  id: string;
  name: string;
  from: string; // swatch gradient
  to: string;
  bg: string; // solid studio background
  ambient: string;
  ambientIntensity: number;
  keyColor: string;
  keyIntensity: number;
  fillColor: string;
  formerIntensity: number; // multiplier for the softbox lightformers
};

export const ENV_PRESETS: EnvPreset[] = [
  {
    id: "studio",
    name: "White Studio",
    from: "#ffffff",
    to: "#e8ecf5",
    bg: "#ffffff",
    ambient: "#ffffff",
    ambientIntensity: 0.6,
    keyColor: "#ffffff",
    keyIntensity: 1.5,
    fillColor: "#ffffff",
    formerIntensity: 1.25,
  },
  {
    id: "city",
    name: "City",
    from: "#dfe7f5",
    to: "#aab7d4",
    bg: "#e6ecf6",
    ambient: "#dbe4f2",
    ambientIntensity: 0.4,
    keyColor: "#eef3ff",
    keyIntensity: 1.1,
    fillColor: "#c9d6ee",
    formerIntensity: 1.0,
  },
  {
    id: "sunset",
    name: "Sunset",
    from: "#ffe4d1",
    to: "#f6b78a",
    bg: "#f8e6d6",
    ambient: "#ffe0c4",
    ambientIntensity: 0.45,
    keyColor: "#ffd3a6",
    keyIntensity: 1.25,
    fillColor: "#ffc48f",
    formerIntensity: 1.05,
  },
  {
    id: "warehouse",
    name: "Warehouse",
    from: "#e6e6ea",
    to: "#b9bcc7",
    bg: "#e9eaee",
    ambient: "#d7d9e0",
    ambientIntensity: 0.35,
    keyColor: "#f2f3f7",
    keyIntensity: 1.0,
    fillColor: "#c4c7d2",
    formerIntensity: 0.9,
  },
  {
    id: "dawn",
    name: "Dawn",
    from: "#e9e3ff",
    to: "#b7a8f0",
    bg: "#efeaff",
    ambient: "#e2daff",
    ambientIntensity: 0.45,
    keyColor: "#f0ebff",
    keyIntensity: 1.15,
    fillColor: "#cdbdf5",
    formerIntensity: 1.05,
  },
];

export type ProductSceneProps = {
  garment: GarmentProps;
  environment: EnvPreset;
  /** Quick controls (direction + broad intensity) from the lighting rail. */
  lighting: Lighting;
  /** HDRI yaw in degrees — rotates lighting/reflections only. */
  envRotationDeg: number;
  exposure: number;
  toneMapping: ToneMappingId;
  background: BackgroundId;
  lights: LightsSettings;
  shadows: ShadowSettings;
  effects: EffectsSettings;
  shadowMapSize: number;
  multisampling: number;
};

/** Key light position per direction, relative to the viewer's start camera. */
const KEY_LIGHT_POS: Record<LightDirection, [number, number, number]> = {
  left: [-7, 3.5, 2.5],
  top: [0, 8, 2],
  right: [7, 3.5, 2.5],
};

/** The main softbox follows the chosen direction so reflections match. */
const KEY_FORMER_POS: Record<LightDirection, [number, number, number]> = {
  left: [-5, 2.5, 2],
  top: [0, 5, 2],
  right: [5, 2.5, 2],
};

/** Fill sits opposite the key so it lifts the shadowed side. */
const FILL_LIGHT_POS: Record<LightDirection, [number, number, number]> = {
  left: [6, 1.5, 3],
  top: [-4.5, 1.5, 3],
  right: [-6, 1.5, 3],
};

/** three.js renderer tone mapping per dropdown option. */
const THREE_TONE_MAPPING: Record<ToneMappingId, THREE.ToneMapping> = {
  aces: THREE.ACESFilmicToneMapping,
  reinhard: THREE.ReinhardToneMapping,
  cineon: THREE.CineonToneMapping,
  neutral: THREE.NeutralToneMapping,
  none: THREE.NoToneMapping,
};

/** Same curves for the post-processing ToneMapping pass. */
const PP_TONE_MAPPING: Record<Exclude<ToneMappingId, "none">, ToneMappingMode> = {
  aces: ToneMappingMode.ACES_FILMIC,
  reinhard: ToneMappingMode.REINHARD,
  cineon: ToneMappingMode.OPTIMIZED_CINEON,
  neutral: ToneMappingMode.NEUTRAL,
};

/**
 * Keeps renderer exposure + tone mapping in sync with the UI.
 * With the EffectComposer mounted the scene MUST render linear
 * (NoToneMapping) so the composer's ToneMapping pass applies the curve
 * exactly once at the end — re-enabling it here would double tone map.
 * `toneMappingExposure` is a renderer-bound uniform that three feeds to
 * every tone-mapped program, including the post pass, so it stays live
 * on both paths. (Lighting is physically correct by default in r155+.)
 */
function RendererBridge({
  exposure,
  toneMapping,
  composerActive,
}: {
  exposure: number;
  toneMapping: ToneMappingId;
  composerActive: boolean;
}) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  useEffect(() => {
    gl.toneMapping = composerActive
      ? THREE.NoToneMapping
      : THREE_TONE_MAPPING[toneMapping];
    // r152+ detects the change per material and rebuilds programs itself.
  }, [gl, toneMapping, composerActive]);
  return null;
}

/** Solid scene backgrounds; transparent/gradient leave alpha for the DOM. */
const SOLID_BG: Partial<Record<BackgroundId, string>> = {
  white: "#ffffff",
  black: "#0b0b0d",
  gray: "#8f929a",
};

export function ProductScene({
  garment,
  environment,
  lighting,
  envRotationDeg,
  exposure,
  toneMapping,
  background,
  lights,
  shadows,
  effects,
  shadowMapSize,
  multisampling,
}: ProductSceneProps) {
  const fi = environment.formerIntensity;

  // Effects requested → composer path; otherwise plain renderer path.
  const composerActive =
    effects.ssao || effects.bloom || effects.vignette || effects.fxaa;

  // Key light color = preset tint × user tint (white = preset unchanged).
  const keyColor = useMemo(
    () =>
      new THREE.Color(environment.keyColor).multiply(
        new THREE.Color(lights.directional.color),
      ),
    [environment.keyColor, lights.directional.color],
  );

  // Yaw-only rotation for the HDRI — model & camera stay independent.
  const envRotation = useMemo<[number, number, number]>(
    () => [0, THREE.MathUtils.degToRad(envRotationDeg), 0],
    [envRotationDeg],
  );

  const solidBg =
    background === "studio" ? environment.bg : SOLID_BG[background];

  return (
    <>
      <RendererBridge
        exposure={exposure}
        toneMapping={toneMapping}
        composerActive={composerActive}
      />

      {solidBg && <color attach="background" args={[solidBg]} />}

      {/* ── Light rig ─────────────────────────────────────── */}
      {lights.ambient.enabled && (
        <ambientLight
          intensity={
            environment.ambientIntensity *
            lighting.ambient *
            lights.ambient.intensity
          }
          color={environment.ambient}
        />
      )}

      {/* Key light — the only shadow caster (keeps the map budget flat).
          Keyed on the map size so the shadow map re-allocates cleanly. */}
      {lights.directional.enabled && (
        <directionalLight
          key={`key-${shadowMapSize}`}
          position={KEY_LIGHT_POS[lighting.direction]}
          intensity={
            environment.keyIntensity *
            lighting.intensity *
            lights.directional.intensity
          }
          color={keyColor}
          castShadow={shadows.enabled}
          shadow-mapSize={[shadowMapSize, shadowMapSize]}
          shadow-bias={shadows.bias}
          shadow-intensity={shadows.strength}
        />
      )}

      {lights.top.enabled && (
        <directionalLight
          position={[0, lights.top.height, 0.6]}
          intensity={lights.top.intensity}
          color="#ffffff"
        />
      )}

      {lights.back.enabled && (
        <directionalLight
          position={[0, 3.2, -6]}
          intensity={lights.back.intensity}
          color="#ffffff"
        />
      )}

      {lights.fill.enabled && (
        <directionalLight
          position={FILL_LIGHT_POS[lighting.direction]}
          intensity={lights.fill.intensity}
          color={environment.fillColor}
        />
      )}

      <group name="EasyVariantsGarment">
        <Center position={[0, 0.05, 0]}>
          {/* key on the GLB url → a product swap fully remounts the model
              (fresh geometry + materials) instead of reconciling in place. */}
          <GarmentModel key={garment.glbUrl} props={garment} />
        </Center>
      </group>

      {shadows.enabled && (
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={shadows.opacity}
          scale={12}
          blur={shadows.blur}
          far={4.5}
          resolution={512}
          color="#0a0a0b"
        />
      )}

      {/* Keyed on preset + light direction so the static env map re-renders.
          environmentRotation spins IBL + reflections only — never the model. */}
      <Environment
        key={`${environment.id}-${lighting.direction}`}
        resolution={256}
        background={background === "hdr"}
        blur={0.6}
        environmentRotation={envRotation}
        backgroundRotation={envRotation}
      >
        <Lightformer form="rect" intensity={3 * fi} position={KEY_FORMER_POS[lighting.direction]} target={[0, 0, 0]} scale={[9, 5, 1]} color={environment.keyColor} />
        <Lightformer form="rect" intensity={1.2 * fi} position={[-5, 1.5, -2]} scale={[5, 5, 1]} color={environment.fillColor} />
        <Lightformer form="ring" intensity={1.6 * fi} position={[5, 3, -3]} scale={3} color={environment.keyColor} />
        <Lightformer form="circle" intensity={0.9 * fi} position={[0, -4, 1]} scale={4} color={environment.fillColor} />
      </Environment>

      {/* ── Post stack — mounted only when an effect is on, so the plain
             renderer path stays copy-free. Order: AO → Bloom (HDR) →
             ToneMapping → Vignette (LDR) → FXAA last on the final image. */}
      {composerActive && (
        <EffectComposer multisampling={multisampling} enableNormalPass={false}>
          <>
            {effects.ssao && (
              <N8AO halfRes aoRadius={1.6} distanceFalloff={0.8} intensity={2.2} />
            )}
            {effects.bloom && (
              <Bloom
                mipmapBlur
                intensity={0.35}
                luminanceThreshold={0.9}
                luminanceSmoothing={0.2}
              />
            )}
            {toneMapping !== "none" && (
              <ToneMapping mode={PP_TONE_MAPPING[toneMapping]} />
            )}
            {effects.vignette && (
              <Vignette eskil={false} offset={0.28} darkness={0.62} />
            )}
            {effects.fxaa && <FXAA />}
          </>
        </EffectComposer>
      )}
    </>
  );
}
