"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createKnitNormalMap, createLogoTexture } from "@/lib/easyvariants/textures";
import { PRODUCTS, DRACO_DECODER_PATH } from "@/lib/easyvariants/config";

/** MeshPhysicalMaterial extensions driven by the Material inspector. */
export type PhysicalProps = {
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  ior: number;
  opacity: number;
  /** Multiplier on the model's authored normal-map scale. */
  normalScale: number;
};

/** Identity values — the model renders exactly as authored. */
export const DEFAULT_PHYSICAL_PROPS: PhysicalProps = {
  clearcoat: 0,
  clearcoatRoughness: 0.2,
  transmission: 0,
  ior: 1.5,
  opacity: 1,
  normalScale: 1,
};

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
  /** Physical material overrides — optional so simple embeds keep working. */
  physical?: PhysicalProps;
  /** Texture anisotropy from the render-quality preset. */
  anisotropy?: number;
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
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  // Clone once, patch the tint shader onto each material once, normalize size.
  const { object, mats, scale } = useMemo(() => {
    const object = scene.clone(true);
    const mats: { mat: THREE.MeshPhysicalMaterial; u: TintUniforms }[] = [];

    // Upgrade Standard → Physical so clearcoat / transmission / IOR are
    // available on any GLB. Copying through the *Standard* prototype keeps
    // Physical's own defaults (clearcoat 0, ior 1.5…) intact instead of
    // importing `undefined` for props the source material never had.
    const upgrade = (m: THREE.Material): THREE.Material => {
      const std = m as THREE.MeshStandardMaterial;
      if (!std || !std.isMeshStandardMaterial) return m;
      let mat: THREE.MeshPhysicalMaterial;
      if ((std as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
        mat = std as THREE.MeshPhysicalMaterial;
      } else {
        mat = new THREE.MeshPhysicalMaterial();
        THREE.MeshStandardMaterial.prototype.copy.call(mat, std);
        // Standard.copy resets `defines` — restore the Physical define set.
        mat.defines = { STANDARD: "", PHYSICAL: "" };
      }
      // Authored values the inspector scales/restores instead of clobbering.
      mat.userData.authoredNormalScale = mat.normalScale.clone();
      mat.userData.authoredTransparent = mat.transparent;

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
      return mat;
    };

    object.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(upgrade)
        : upgrade(mesh.material);
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
    const p = props.physical ?? DEFAULT_PHYSICAL_PROPS;
    mats.forEach(({ mat, u }) => {
      u.uTintStrength.value = isOriginal ? 0 : 0.85;
      if (!isOriginal) u.uTintColor.value.set(c);
      u.uDetail.value = props.textures ?? true ? 1 : 0;
      // Fabric presets drive the surface finish (matte ↔ satin).
      mat.roughness = props.roughness;
      mat.metalness = props.metalness;
      mat.envMapIntensity = props.envIntensity;
      mat.wireframe = props.wireframe;
      // Physical extensions from the Material inspector.
      mat.clearcoat = p.clearcoat;
      mat.clearcoatRoughness = p.clearcoatRoughness;
      mat.transmission = p.transmission;
      mat.ior = p.ior;
      mat.opacity = p.opacity;
      mat.transparent = mat.userData.authoredTransparent || p.opacity < 1;
      const authored = mat.userData.authoredNormalScale as THREE.Vector2;
      if (mat.normalMap && authored)
        mat.normalScale.set(authored.x * p.normalScale, authored.y * p.normalScale);
      // Recompile only when a shader feature flips (clearcoat/transmission/
      // transparency crossing zero) — never on plain slider ticks, so
      // dragging stays at full frame rate.
      const featureKey = `${p.clearcoat > 0}|${p.transmission > 0}|${mat.transparent}`;
      if (mat.userData.featureKey !== featureKey) {
        mat.userData.featureKey = featureKey;
        mat.needsUpdate = true;
      }
    });
  }, [
    mats,
    props.color,
    props.textures,
    props.roughness,
    props.metalness,
    props.envIntensity,
    props.wireframe,
    props.physical,
  ]);

  // Texture anisotropy follows the render-quality preset. Re-uploading a
  // texture is costly, so only touched when the value actually changes.
  useEffect(() => {
    const aniso = Math.min(props.anisotropy ?? 1, maxAnisotropy);
    mats.forEach(({ mat }) => {
      [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap]
        .filter((t): t is THREE.Texture => Boolean(t))
        .forEach((tex) => {
          if (tex.anisotropy !== aniso) {
            tex.anisotropy = aniso;
            tex.needsUpdate = true;
          }
        });
    });
  }, [mats, props.anisotropy, maxAnisotropy]);

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
  physical,
}: {
  color: string;
  roughness: number;
  metalness: number;
  envIntensity: number;
  normalScale: number;
  normalMap: THREE.Texture | null;
  physical: PhysicalProps;
}) {
  return useMemo(
    () => ({
      color,
      roughness,
      metalness,
      envMapIntensity: envIntensity,
      normalMap: normalMap ?? undefined,
      // Inspector's normal scale multiplies the fabric preset's.
      normalScale: new THREE.Vector2(
        normalScale * physical.normalScale,
        normalScale * physical.normalScale,
      ),
      clearcoat: physical.clearcoat,
      clearcoatRoughness: physical.clearcoatRoughness,
      transmission: physical.transmission,
      ior: physical.ior,
      opacity: physical.opacity,
      transparent: physical.opacity < 1,
    }),
    [color, roughness, metalness, envIntensity, normalScale, normalMap, physical],
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
    physical: props.physical ?? DEFAULT_PHYSICAL_PROPS,
  });

  const Surface = () =>
    props.normals ? (
      <meshNormalMaterial wireframe={props.wireframe} />
    ) : (
      // Physical (not Standard) so the inspector's clearcoat/transmission
      // controls also work on the procedural fallback garment.
      <meshPhysicalMaterial {...matProps} wireframe={props.wireframe} />
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
