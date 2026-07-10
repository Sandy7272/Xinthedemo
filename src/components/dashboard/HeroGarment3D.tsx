"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { GarmentModel } from "./viewer/GarmentModel";
import { StudioEnvironment } from "./viewer/StudioEnvironment";
import { DEFAULT_PRODUCT } from "@/lib/easyvariants/config";

function SpinningGarment() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.35;
  });
  return (
    <group ref={ref}>
      <GarmentModel
        props={{
          glbUrl: DEFAULT_PRODUCT.glbUrl,
          color: "#22315f",
          roughness: 0.9,
          metalness: 0,
          wireframe: false,
          normals: false,
          normalScale: 1,
          envIntensity: 1.2,
          logoMonogram: "EV",
        }}
      />
    </group>
  );
}

/** Compact, non-interactive auto-rotating garment for the hero banner. */
export default function HeroGarment3D() {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.3, 4.4], fov: 40 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
          <SpinningGarment />
        </Float>
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.35}
          scale={9}
          blur={2.8}
          far={4}
          color="#0a0a0b"
        />
        <StudioEnvironment />
      </Suspense>
    </Canvas>
  );
}
