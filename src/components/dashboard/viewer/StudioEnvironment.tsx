"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Self-contained studio HDR environment built from Lightformers.
 * Gives soft-box reflections without downloading any external HDR file.
 */
export function StudioEnvironment({
  intensity = 1,
}: {
  intensity?: number;
}) {
  return (
    <Environment resolution={256} background={false}>
      {/* key soft-box */}
      <Lightformer
        form="rect"
        intensity={3 * intensity}
        position={[0, 4, 3]}
        scale={[9, 5, 1]}
        color="#ffffff"
      />
      {/* fill */}
      <Lightformer
        form="rect"
        intensity={1.2 * intensity}
        position={[-5, 1.5, -2]}
        scale={[5, 5, 1]}
        color="#dbe4ff"
      />
      {/* rim */}
      <Lightformer
        form="ring"
        intensity={1.6 * intensity}
        position={[5, 3, -3]}
        scale={3}
        color="#ffffff"
      />
      {/* bounce */}
      <Lightformer
        form="circle"
        intensity={0.9 * intensity}
        position={[0, -4, 1]}
        scale={4}
        color="#eef2ff"
      />
    </Environment>
  );
}
