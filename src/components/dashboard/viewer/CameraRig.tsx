"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraApi, CameraViewId } from "./viewer-settings-context";

/**
 * Lives inside the Canvas and registers an imperative camera API on the
 * shared ref so DOM panels (CameraControls) can drive the 3D camera.
 * View changes tween position + orbit target with an ease-in-out curve
 * instead of snapping — user input cancels an in-flight tween.
 */

/** Unit view directions. Top/bottom keep a tiny offset off the exact pole so
 *  OrbitControls' spherical math never hits the polar singularity. */
const VIEW_DIRECTIONS: Record<CameraViewId, [number, number, number]> = {
  front: [0, 0.12, 1],
  back: [0, 0.12, -1],
  left: [-1, 0.12, 0],
  right: [1, 0.12, 0],
  top: [0.02, 1, 0.08],
  bottom: [0.02, -1, 0.08],
  iso: [1, 0.72, 1],
};

/** Matches the Canvas' initial camera so Reset returns to the true home pose. */
export const HOME_CAMERA_POSITION: [number, number, number] = [2.6, 1.2, 3.6];

const FIT_PADDING = 1.18; // breathing room around the bounding sphere
const TWEEN_MS = 650;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Tween = {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
};

export function CameraRig({
  apiRef,
  controlsRef,
  modelName = "EasyVariantsGarment",
}: {
  apiRef: MutableRefObject<CameraApi | null>;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  /** Name of the scene group whose bounds drive "Fit model" / view distance. */
  modelName?: string;
}) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const tween = useRef<Tween | null>(null);

  useEffect(() => {
    /** Bounding sphere of the product (fallback ≈ the normalized model size). */
    const measure = () => {
      const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1.4);
      const model = scene.getObjectByName(modelName);
      if (model) new THREE.Box3().setFromObject(model).getBoundingSphere(sphere);
      return sphere;
    };

    /** Distance that fits the sphere for the current fov/aspect. */
    const fitDistance = (radius: number) => {
      const persp = camera as THREE.PerspectiveCamera;
      const vFov = THREE.MathUtils.degToRad(persp.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * persp.aspect);
      const d = (radius * FIT_PADDING) / Math.sin(Math.min(vFov, hFov) / 2);
      // Respect the OrbitControls zoom range so the tween never fights it.
      return THREE.MathUtils.clamp(d, 2.2, 9);
    };

    const animateTo = (pos: THREE.Vector3, target: THREE.Vector3) => {
      const controls = controlsRef.current;
      tween.current = {
        fromPos: camera.position.clone(),
        toPos: pos,
        fromTarget: controls ? controls.target.clone() : new THREE.Vector3(),
        toTarget: target,
        start: performance.now(),
      };
    };

    apiRef.current = {
      setView: (view: CameraViewId) => {
        const sphere = measure();
        const dir = new THREE.Vector3(...VIEW_DIRECTIONS[view]).normalize();
        const pos = sphere.center
          .clone()
          .addScaledVector(dir, fitDistance(sphere.radius));
        animateTo(pos, sphere.center.clone());
      },
      fit: () => {
        const sphere = measure();
        const controls = controlsRef.current;
        // Keep the current viewing angle, just reframe distance + target.
        const dir = camera.position
          .clone()
          .sub(controls ? controls.target : sphere.center)
          .normalize();
        const pos = sphere.center
          .clone()
          .addScaledVector(dir, fitDistance(sphere.radius));
        animateTo(pos, sphere.center.clone());
      },
      reset: () => {
        animateTo(
          new THREE.Vector3(...HOME_CAMERA_POSITION),
          new THREE.Vector3(0, 0, 0),
        );
      },
    };

    // User grabbing the orbit cancels any in-flight tween.
    const controls = controlsRef.current;
    const cancel = () => (tween.current = null);
    controls?.addEventListener("start", cancel);

    return () => {
      controls?.removeEventListener("start", cancel);
      apiRef.current = null;
    };
  }, [apiRef, controlsRef, camera, scene, modelName]);

  useFrame(() => {
    const t = tween.current;
    if (!t) return;
    const controls = controlsRef.current;
    const e = Math.min(1, (performance.now() - t.start) / TWEEN_MS);
    const k = easeInOutCubic(e);
    camera.position.lerpVectors(t.fromPos, t.toPos, k);
    if (controls) {
      controls.target.lerpVectors(t.fromTarget, t.toTarget, k);
      controls.update();
    }
    if (e >= 1) tween.current = null;
  });

  return null;
}
