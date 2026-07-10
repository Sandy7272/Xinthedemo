"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  AdaptiveDpr,
  PerformanceMonitor,
  Html,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  Box,
  Maximize2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from "lucide-react";
import { ProductScene, ENV_PRESETS } from "./ProductScene";
import { ViewerToolbar } from "../ViewerToolbar";
import { ReconstructionOverlay } from "../ReconstructionOverlay";
import { useStudio } from "../studio-context";
import { useWizard } from "../wizard/wizard-context";
import { FABRIC_PRESETS, LOGO_OPTIONS } from "@/lib/easyvariants/config";
import { downloadDataUrl } from "@/lib/easyvariants/exporters";
import type { GarmentProps } from "./GarmentModel";

const RES_OPTIONS: { label: string; dpr: number }[] = [
  { label: "HD", dpr: 1.25 },
  { label: "Full HD", dpr: 1.75 },
  { label: "4K", dpr: 2 },
];

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand-500" />
        <span className="text-xs text-ink-muted">Loading model…</span>
      </div>
    </Html>
  );
}

export default function ProductViewer() {
  const { baseColor, materials, toggles, fabricId, logoId, viewerRef, status } =
    useStudio();
  const { product } = useWizard();

  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [dpr, setDpr] = useState(1.25);
  const [perfDpr, setPerfDpr] = useState(1.25);
  const [resLabel, setResLabel] = useState("HD");
  const [env, setEnv] = useState(0);

  const fabric = FABRIC_PRESETS.find((f) => f.id === fabricId) ?? FABRIC_PRESETS[0];
  const logo = LOGO_OPTIONS.find((l) => l.id === logoId) ?? LOGO_OPTIONS[0];

  const garment: GarmentProps = {
    glbUrl: product.glbUrl,
    color: baseColor,
    roughness: materials.roughness,
    metalness: materials.metalness,
    wireframe: toggles.wireframe,
    normals: toggles.normals,
    normalScale: toggles.textures ? fabric.normalScale : 0,
    envIntensity: materials.envIntensity,
    textures: toggles.textures,
    logoMonogram: logo.monogram,
  };

  const resetCamera = useCallback(() => controlsRef.current?.reset(), []);

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  const screenshot = useCallback(() => {
    const api = viewerRef.current;
    if (!api) return;
    api.gl.render(api.scene, api.camera);
    downloadDataUrl(api.gl.domElement.toDataURL("image/png"), "easyvariants-render.png");
  }, [viewerRef]);

  const onRes = (label: string) => {
    const opt = RES_OPTIONS.find((r) => r.label === label) ?? RES_OPTIONS[0];
    setResLabel(label);
    setDpr(opt.dpr);
    setPerfDpr(opt.dpr);
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink">
            <Box className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-sm font-semibold text-ink">3D Viewer</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12b76a]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0f9457]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
            {status === "generating" ? "Reconstructing" : "Model Ready"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={resLabel}
              onChange={(e) => onRes(e.target.value)}
              aria-label="Render resolution"
              className="cursor-pointer appearance-none rounded-lg border border-line bg-white py-1.5 pl-3 pr-7 text-[13px] font-medium text-ink shadow-soft focus:outline-none"
            >
              {RES_OPTIONS.map((r) => (
                <option key={r.label} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-ink-faint" />
          </div>
          <button
            type="button"
            onClick={screenshot}
            aria-label="Screenshot"
            title="Screenshot"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-surface-subtle"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-surface-subtle"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Stage */}
      <div
        ref={stageRef}
        className="viewer-stage relative min-h-[280px] flex-1 bg-surface-subtle"
      >
        <Canvas
          className="!absolute inset-0"
          shadows
          dpr={dpr}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
          camera={{ position: [2.6, 1.2, 3.6], fov: 40 }}
          onCreated={(state) => {
            state.gl.toneMapping = THREE.ACESFilmicToneMapping;
            viewerRef.current = {
              gl: state.gl,
              scene: state.scene,
              camera: state.camera,
              model: null,
            };
          }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(Math.max(1, perfDpr - 0.5))}
            onIncline={() => setDpr(perfDpr)}
          />
          <Suspense fallback={<CanvasLoader />}>
            <ProductScene
              garment={garment}
              exposure={materials.exposure}
              environment={ENV_PRESETS[env]}
              studioBackground={toggles.studio}
              ao={toggles.ao}
            />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={toggles.pan}
            enableZoom={toggles.zoom}
            autoRotate={toggles.autoRotate}
            autoRotateSpeed={1.1}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.2}
            maxDistance={9}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI - 0.3}
          />
          <AdaptiveDpr pixelated />
        </Canvas>

        {/* Left vertical toolbar */}
        <ViewerToolbar />

        {/* Reset camera (bottom-left) */}
        <button
          type="button"
          onClick={resetCamera}
          title="Reset camera"
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-ink-soft shadow-soft backdrop-blur transition-colors hover:text-ink"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Reset
        </button>

        <ReconstructionOverlay />

        {/* HDRI environment carousel */}
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white/90 p-1.5 shadow-card backdrop-blur-xl">
            <button
              type="button"
              aria-label="Previous environment"
              onClick={() => setEnv((e) => (e - 1 + ENV_PRESETS.length) % ENV_PRESETS.length)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {ENV_PRESETS.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setEnv(i)}
                title={h.name}
                aria-label={h.name}
                className={cnEnv(env === i)}
                style={{
                  background: `linear-gradient(135deg, ${h.from}, ${h.to})`,
                }}
              />
            ))}
            <button
              type="button"
              aria-label="Next environment"
              onClick={() => setEnv((e) => (e + 1) % ENV_PRESETS.length)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function cnEnv(active: boolean) {
  return [
    "h-9 w-11 rounded-lg border-2 transition-transform hover:scale-105",
    active ? "border-brand-500 ring-2 ring-brand-200" : "border-white/70",
  ].join(" ");
}
