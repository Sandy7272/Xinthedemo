"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Center, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { GarmentModel, type GarmentProps } from "./GarmentModel";

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
  exposure: number;
  environment: EnvPreset;
  studioBackground: boolean;
  ao: boolean;
};

function ExposureBridge({ exposure }: { exposure: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  return null;
}

export function ProductScene({
  garment,
  exposure,
  environment,
  studioBackground,
  ao,
}: ProductSceneProps) {
  const fi = environment.formerIntensity;

  return (
    <>
      <ExposureBridge exposure={exposure} />

      {studioBackground && <color attach="background" args={[environment.bg]} />}

      <ambientLight
        intensity={environment.ambientIntensity}
        color={environment.ambient}
      />
      <directionalLight
        position={[5, 8, 4]}
        intensity={environment.keyIntensity}
        color={environment.keyColor}
        castShadow
      />

      <group name="EasyVariantsGarment">
        <Center position={[0, 0.05, 0]}>
          {/* key on the GLB url → a product swap fully remounts the model
              (fresh geometry + materials) instead of reconciling in place. */}
          <GarmentModel key={garment.glbUrl} props={garment} />
        </Center>
      </group>

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.4}
        scale={12}
        blur={2.6}
        far={4.5}
        resolution={512}
        color="#0a0a0b"
      />

      <Environment resolution={256} background={!studioBackground} blur={0.6}>
        <Lightformer form="rect" intensity={3 * fi} position={[0, 4, 3]} scale={[9, 5, 1]} color={environment.keyColor} />
        <Lightformer form="rect" intensity={1.2 * fi} position={[-5, 1.5, -2]} scale={[5, 5, 1]} color={environment.fillColor} />
        <Lightformer form="ring" intensity={1.6 * fi} position={[5, 3, -3]} scale={3} color={environment.keyColor} />
        <Lightformer form="circle" intensity={0.9 * fi} position={[0, -4, 1]} scale={4} color={environment.fillColor} />
      </Environment>

      {ao ? (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <N8AO halfRes aoRadius={1.6} distanceFalloff={0.8} intensity={2.2} />
          <Bloom
            mipmapBlur
            intensity={0.35}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.2}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            intensity={0.35}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.2}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}
