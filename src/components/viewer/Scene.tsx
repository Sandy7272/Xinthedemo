"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  Center,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { MODEL_URL, MODEL_URL_IS_PLACEHOLDER } from "@/lib/config";

export type MaterialControls = {
  roughness: number;
  metalness: number;
  wireframe: boolean;
  exposure: number;
};

/** Keeps renderer tone-mapping exposure in sync with the exposure slider. */
function ExposureBridge({ exposure }: { exposure: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  return null;
}

/**
 * Loads a real .glb/.gltf model and applies the live material controls
 * by traversing every mesh in the scene graph.
 */
function GltfModel({
  url,
  controls,
}: {
  url: string;
  controls: MaterialControls;
}) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          mat.roughness = controls.roughness;
          mat.metalness = controls.metalness;
          mat.wireframe = controls.wireframe;
          mat.needsUpdate = true;
        }
      });
    });
  }, [cloned, controls]);

  return (
    <Center>
      <primitive object={cloned} />
    </Center>
  );
}

/**
 * Built-in procedural PBR product shown when MODEL_URL is still the
 * placeholder. Fully interactive so every material control is demonstrable
 * — no network or asset required.
 */
function FallbackModel({ controls }: { controls: MaterialControls }) {
  const group = useRef<THREE.Group>(null);

  return (
    <Center>
      <group ref={group}>
        {/* Main rounded product body */}
        <RoundedBox
          args={[1.5, 1.5, 1.5]}
          radius={0.34}
          smoothness={10}
          creaseAngle={0.5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#e9edf5"
            roughness={controls.roughness}
            metalness={controls.metalness}
            wireframe={controls.wireframe}
            envMapIntensity={1.1}
          />
        </RoundedBox>

        {/* Accent ring to add curvature + reflections */}
        <mesh
          position={[0, 0, 0]}
          rotation={[Math.PI / 2.4, 0, Math.PI / 5]}
          castShadow
        >
          <torusGeometry args={[1.15, 0.075, 32, 96]} />
          <meshStandardMaterial
            color="#3366ff"
            roughness={Math.min(controls.roughness, 0.35)}
            metalness={Math.max(controls.metalness, 0.6)}
            wireframe={controls.wireframe}
            envMapIntensity={1.4}
          />
        </mesh>

        {/* Small floating sphere detail */}
        <mesh position={[0.62, 0.95, 0.62]} castShadow>
          <sphereGeometry args={[0.24, 48, 48]} />
          <meshStandardMaterial
            color="#0a0a0b"
            roughness={controls.roughness}
            metalness={controls.metalness}
            wireframe={controls.wireframe}
            envMapIntensity={1.2}
          />
        </mesh>
      </group>
    </Center>
  );
}

export function Scene({ controls }: { controls: MaterialControls }) {
  return (
    <>
      <ExposureBridge exposure={controls.exposure} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1}
        color="#ffffff"
      />

      {MODEL_URL_IS_PLACEHOLDER ? (
        <FallbackModel controls={controls} />
      ) : (
        <GltfModel url={MODEL_URL} controls={controls} />
      )}

      {/* Soft ground contact shadow */}
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.42}
        scale={12}
        blur={2.6}
        far={4}
        resolution={512}
        color="#0a0a0b"
      />

      {/* Self-contained studio HDR environment for reflections (no network) */}
      <Environment resolution={256} background={false}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 4, 2]}
          scale={[8, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 1, -3]}
          scale={[4, 4, 1]}
          color="#cdd7ff"
        />
        <Lightformer
          form="ring"
          intensity={1.6}
          position={[4, 3, 2]}
          scale={2.5}
          color="#ffffff"
        />
        <Lightformer
          form="circle"
          intensity={1}
          position={[0, -3, -2]}
          scale={3}
          color="#eef4ff"
        />
      </Environment>
    </>
  );
}

// Preload only when a real model URL is configured.
if (!MODEL_URL_IS_PLACEHOLDER) {
  useGLTF.preload(MODEL_URL);
}
