"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Scene, type MaterialControls } from "./Scene";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import { MODEL_URL_IS_PLACEHOLDER } from "@/lib/config";
import {
  IconRotate,
  IconReset,
  IconWireframe,
  IconMaximize,
  IconCamera,
  IconSliders,
  IconCube,
} from "@/components/ui/icons";

type BgOption = { name: string; value: string; dark?: boolean };

const BG_OPTIONS: BgOption[] = [
  { name: "Snow", value: "#ffffff" },
  { name: "Fog", value: "#f2f3f5" },
  { name: "Slate", value: "#1a1a1e", dark: true },
  { name: "Ink", value: "#0a0a0b", dark: true },
  { name: "Sky", value: "#eef4ff" },
];

const DEFAULTS = {
  roughness: 0.35,
  metalness: 0.55,
  exposure: 1,
};

/** A compact icon toggle used in the floating viewer toolbar. */
function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl border transition-all duration-200",
        active
          ? "border-ink bg-ink text-white shadow-soft"
          : "border-line bg-white/90 text-ink-soft backdrop-blur hover:bg-white hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
        <span className="text-xs font-medium text-ink-muted">
          Loading model…
        </span>
      </div>
    </Html>
  );
}

export default function ModelViewer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [roughness, setRoughness] = useState(DEFAULTS.roughness);
  const [metalness, setMetalness] = useState(DEFAULTS.metalness);
  const [exposure, setExposure] = useState(DEFAULTS.exposure);
  const [bg, setBg] = useState<BgOption>(BG_OPTIONS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controls: MaterialControls = {
    roughness,
    metalness,
    wireframe,
    exposure,
  };

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const resetCamera = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  const resetMaterials = useCallback(() => {
    setRoughness(DEFAULTS.roughness);
    setMetalness(DEFAULTS.metalness);
    setExposure(DEFAULTS.exposure);
    setWireframe(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    const gl = glRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!gl || !scene || !camera) return;
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "product-3d.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_308px]">
      {/* ───────── Canvas stage ───────── */}
      <div
        ref={stageRef}
        className={cn(
          "viewer-stage group relative overflow-hidden rounded-3xl border border-line",
          bg.dark ? "bg-ink" : "bg-surface-subtle",
        )}
      >
        <div className="relative h-[420px] w-full sm:h-[520px]">
          <Canvas
            shadows
            dpr={[1, 2]}
            frameloop="always"
            gl={{
              preserveDrawingBuffer: true,
              antialias: true,
              alpha: false,
            }}
            camera={{ position: [2.8, 1.7, 3.4], fov: 42 }}
            onCreated={(state) => {
              glRef.current = state.gl;
              sceneRef.current = state.scene;
              cameraRef.current = state.camera;
            }}
          >
            <color attach="background" args={[bg.value]} />
            <Suspense fallback={<Loader />}>
              <Scene controls={controls} />
            </Suspense>
            <OrbitControls
              ref={controlsRef}
              makeDefault
              autoRotate={autoRotate}
              autoRotateSpeed={1.1}
              enableDamping
              dampingFactor={0.08}
              minDistance={2.2}
              maxDistance={8}
              minPolarAngle={0.25}
              maxPolarAngle={Math.PI - 0.35}
            />
          </Canvas>
        </div>

        {/* Top-left: model info chip */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-ink-muted shadow-soft backdrop-blur">
          <IconCube className="h-3.5 w-3.5 text-brand-500" />
          {MODEL_URL_IS_PLACEHOLDER ? "Sample Asset" : "Your Model"} · PBR · GLB
        </div>

        {/* Top-right: background swatches */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1.5 shadow-soft backdrop-blur">
          {BG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setBg(option)}
              aria-label={`Background: ${option.name}`}
              title={option.name}
              className={cn(
                "h-5 w-5 rounded-full border transition-transform hover:scale-110",
                bg.value === option.value
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-line",
              )}
              style={{ backgroundColor: option.value }}
            />
          ))}
        </div>

        {/* Bottom: floating toolbar */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white/85 p-1.5 shadow-card backdrop-blur-xl">
            <ToolButton
              active={autoRotate}
              label="Toggle auto-rotate"
              onClick={() => setAutoRotate((v) => !v)}
            >
              <IconRotate className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              active={wireframe}
              label="Toggle wireframe"
              onClick={() => setWireframe((v) => !v)}
            >
              <IconWireframe className="h-4 w-4" />
            </ToolButton>
            <ToolButton label="Reset camera" onClick={resetCamera}>
              <IconReset className="h-4 w-4" />
            </ToolButton>
            <ToolButton label="Take screenshot" onClick={takeScreenshot}>
              <IconCamera className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              active={isFullscreen}
              label="Toggle fullscreen"
              onClick={toggleFullscreen}
            >
              <IconMaximize className="h-4 w-4" />
            </ToolButton>
          </div>
        </div>
      </div>

      {/* ───────── Control panel ───────── */}
      <div className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-muted text-ink">
              <IconSliders className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-ink">Material & Render</h3>
          </div>
          <button
            type="button"
            onClick={resetMaterials}
            className="text-xs font-medium text-ink-faint transition-colors hover:text-ink"
          >
            Reset
          </button>
        </div>

        <div className="space-y-5">
          <Slider
            label="Roughness"
            value={roughness}
            onChange={setRoughness}
          />
          <Slider
            label="Metalness"
            value={metalness}
            onChange={setMetalness}
          />
          <Slider
            label="Exposure"
            value={exposure}
            min={0.4}
            max={2}
            step={0.01}
            onChange={setExposure}
            format={(v) => `${v.toFixed(2)}×`}
          />
        </div>

        <div className="h-px bg-line" />

        <div className="grid grid-cols-2 gap-2">
          <MiniToggle
            active={autoRotate}
            label="Auto-Rotate"
            onClick={() => setAutoRotate((v) => !v)}
          />
          <MiniToggle
            active={wireframe}
            label="Wireframe"
            onClick={() => setWireframe((v) => !v)}
          />
        </div>

        <div className="rounded-2xl bg-surface-subtle p-3.5">
          <p className="text-[11px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink-soft">Tip:</span> Drag to
            orbit, scroll to zoom. Adjust roughness and metalness to preview
            different material finishes in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition-all",
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink-soft hover:border-ink/20",
      )}
    >
      {label}
      <span
        className={cn(
          "ml-2 h-3.5 w-3.5 rounded-full border transition-colors",
          active ? "border-white bg-brand-400" : "border-ink-faint bg-transparent",
        )}
      />
    </button>
  );
}
