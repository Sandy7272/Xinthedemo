"use client";

import { useEffect, useMemo } from "react";
import { RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createKnitNormalMap, createLogoTexture } from "@/lib/easyvariants/textures";
import { PRODUCTS, DRACO_DECODER_PATH } from "@/lib/easyvariants/config";

export type GarmentProps = {
  /** The 3D asset to load (per selected product). Empty → procedural fallback. */
  glbUrl: string;
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  normals: boolean;
  normalScale: number;
  envIntensity: number;
  textures?: boolean; // fabric detail on/off for the GLB
  logoMonogram: string;
};

const isPlaceholderGlb = (url: string) =>
  !url || url === "YOUR_SWEATSHIRT_GLB_URL" || url.trim() === "";

// ── Minimal GPU tint: recolour by the base map's LUMINANCE so any colour stays
//    clean (no muddy multiply) while the fabric shading is preserved. One tiny
//    onBeforeCompile — no extra materials, no heavy pipeline. ─────────────────
type TintUniforms = {
  uTintColor: { value: THREE.Color };
  uTintScale: { value: number };
  uTintStrength: { value: number }; // 0 = original texture untouched
  uDetail: { value: number };
};

const TINT_DECLS = /* glsl */ `
uniform vec3 uTintColor;
uniform float uTintScale;
uniform float uTintStrength;
uniform float uDetail;
`;

// At uTintStrength 0 the original texel passes through unchanged (real model).
const TINT_MAP_FRAGMENT = /* glsl */ `
#ifdef USE_MAP
  vec4 texel = texture2D( map, vMapUv );
  float lum = clamp(dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  float shade = mix(0.62, lum, uDetail);   // uDetail 0 = flat, 1 = full fabric detail
  vec3 tinted = uTintColor * shade * uTintScale;
  texel.rgb = mix(texel.rgb, tinted, uTintStrength);
  diffuseColor *= texel;
#endif
`;

/**
 * Loads the shared GLB and applies live controls by mutating its existing
 * materials — colour tint, roughness/metalness (fabric), wireframe. The model
 * is loaded once and never duplicated. Colour defaults to white (identity tint)
 * so the GLB shows its real texture; swatches tint from there.
 */
function GltfGarment({ props }: { props: GarmentProps }) {
  const { scene } = useGLTF(props.glbUrl, DRACO_DECODER_PATH);

  // Clone once, patch the tint shader onto each material once, normalize size.
  const { object, mats, scale } = useMemo(() => {
    const object = scene.clone(true);
    const mats: { mat: THREE.MeshStandardMaterial; u: TintUniforms }[] = [];

    object.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      list.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat || !("color" in mat)) return;
        const u: TintUniforms = {
          uTintColor: { value: new THREE.Color("#d92d20") },
          uTintScale: { value: 1.6 },
          uTintStrength: { value: 0 }, // start on ORIGINAL — no recolour
          uDetail: { value: 1 },
        };
        // White base → shader owns the colour; a no-op patch still shows texture.
        mat.color.set("#ffffff");
        mat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, u);
          shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>\n${TINT_DECLS}`)
            .replace("#include <map_fragment>", TINT_MAP_FRAGMENT);
        };
        mat.customProgramCacheKey = () => "xinthe-tint-v1";
        mat.needsUpdate = true;
        mats.push({ mat, u });
      });
    });

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object, mats, scale: 2.3 / maxDim };
  }, [scene]);

  useEffect(() => {
    // "original" (default) → strength 0, the GLB's authored materials show as-is.
    // A colour swatch → tint on. We deliberately do NOT touch roughness/metalness/
    // envMapIntensity so the original model renders exactly as authored.
    const c = props.color;
    const isOriginal = !c || c === "original";
    mats.forEach(({ mat, u }) => {
      u.uTintStrength.value = isOriginal ? 0 : 0.85;
      if (!isOriginal) u.uTintColor.value.set(c);
      u.uDetail.value = props.textures ?? true ? 1 : 0;
      // Fabric presets drive the surface finish (matte ↔ satin).
      mat.roughness = props.roughness;
      mat.metalness = props.metalness;
      mat.envMapIntensity = props.envIntensity;
      mat.wireframe = props.wireframe;
    });
  }, [
    mats,
    props.color,
    props.textures,
    props.roughness,
    props.metalness,
    props.envIntensity,
    props.wireframe,
  ]);

  return <primitive object={object} scale={scale} />;
}

/** Chooses the correct material for the current render mode. */
function useFabricMaterialProps({
  color,
  roughness,
  metalness,
  envIntensity,
  normalScale,
  normalMap,
}: {
  color: string;
  roughness: number;
  metalness: number;
  envIntensity: number;
  normalScale: number;
  normalMap: THREE.Texture | null;
}) {
  return useMemo(
    () => ({
      color,
      roughness,
      metalness,
      envMapIntensity: envIntensity,
      normalMap: normalMap ?? undefined,
      normalScale: new THREE.Vector2(normalScale, normalScale),
    }),
    [color, roughness, metalness, envIntensity, normalScale, normalMap],
  );
}

/** Built-in procedural sweatshirt — the offline fallback when no GLB is set. */
function ProceduralGarment({ props }: { props: GarmentProps }) {
  const normalMap = useMemo(() => createKnitNormalMap(), []);
  const logoTexture = useMemo(
    () => createLogoTexture(props.logoMonogram),
    [props.logoMonogram],
  );

  const matProps = useFabricMaterialProps({
    color: props.color,
    roughness: props.roughness,
    metalness: props.metalness,
    envIntensity: props.envIntensity,
    normalScale: props.normalScale,
    normalMap: props.normals ? null : normalMap,
  });

  const Surface = () =>
    props.normals ? (
      <meshNormalMaterial wireframe={props.wireframe} />
    ) : (
      <meshStandardMaterial {...matProps} wireframe={props.wireframe} />
    );

  return (
    <group position={[0, -0.1, 0]}>
      {/* Torso */}
      <RoundedBox
        args={[1.5, 1.7, 0.62]}
        radius={0.26}
        smoothness={8}
        castShadow
        receiveShadow
        position={[0, 0.1, 0]}
      >
        <Surface />
      </RoundedBox>

      {/* Waistband / hem */}
      <RoundedBox
        args={[1.52, 0.3, 0.64]}
        radius={0.12}
        smoothness={6}
        castShadow
        receiveShadow
        position={[0, -0.78, 0]}
      >
        <Surface />
      </RoundedBox>

      {/* Collar */}
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.085, 20, 48]} />
        <Surface />
      </mesh>

      {/* Left sleeve */}
      <group position={[-0.86, 0.28, 0]} rotation={[0, 0, 0.62]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.21, 1.2, 28]} />
          <Surface />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <torusGeometry args={[0.2, 0.06, 16, 36]} />
          <Surface />
        </mesh>
      </group>

      {/* Right sleeve */}
      <group position={[0.86, 0.28, 0]} rotation={[0, 0, -0.62]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.21, 1.2, 28]} />
          <Surface />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <torusGeometry args={[0.2, 0.06, 16, 36]} />
          <Surface />
        </mesh>
      </group>

      {/* Chest logo */}
      {logoTexture && !props.wireframe && !props.normals && (
        <mesh position={[0, 0.28, 0.315]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            roughness={0.6}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      )}
    </group>
  );
}

export function GarmentModel({ props }: { props: GarmentProps }) {
  return isPlaceholderGlb(props.glbUrl) ? (
    <ProceduralGarment props={props} />
  ) : (
    <GltfGarment props={props} />
  );
}

// Warm the cache for every catalog product so switching is instant.
PRODUCTS.forEach((p) => {
  if (!isPlaceholderGlb(p.glbUrl)) useGLTF.preload(p.glbUrl, DRACO_DECODER_PATH);
});
