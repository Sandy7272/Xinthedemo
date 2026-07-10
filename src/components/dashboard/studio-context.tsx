"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MutableRefObject } from "react";
import type * as THREE from "three";
import {
  DEFAULT_METADATA,
  FABRIC_PRESETS,
  MATERIAL_PRESETS,
  RECONSTRUCTION_STEPS,
  VIEW_ORDER,
  type SampleImage,
} from "@/lib/easyvariants/config";
import type {
  GenerationStatus,
  ProductMetadata,
  UploadedView,
  VariantTab,
  ViewKey,
} from "@/lib/easyvariants/types";

type ViewMap = Record<ViewKey, UploadedView>;

type RenderToggles = {
  autoRotate: boolean;
  wireframe: boolean;
  normals: boolean;
  textures: boolean; // apply fabric normal map
  ao: boolean;
  studio: boolean; // true = white studio, false = HDRI environment bg
  pan: boolean;
  zoom: boolean;
  showDimensions: boolean;
};

type Materials = {
  roughness: number;
  metalness: number;
  exposure: number;
  envIntensity: number;
  background: string;
};

const DEFAULT_MATERIALS: Materials = {
  roughness: 0.8, // ~matches the GLB's authored finish (fabric presets change it)
  metalness: 0.0,
  exposure: 1.0,
  envIntensity: 1.0,
  background: "#f4f5f7",
};

export type ViewerApi = {
  gl: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  model: THREE.Object3D | null;
};

export type UploadMode = "single" | "multi";

type StudioValue = {
  // uploads
  uploadMode: UploadMode;
  setUploadMode: (mode: UploadMode) => void;
  views: ViewMap;
  uploadedCount: number;
  addFile: (key: ViewKey, file: File) => void;
  setViewFromSample: (key: ViewKey, sample: SampleImage) => void;
  removeView: (key: ViewKey) => void;
  loadSamples: () => void;
  clearViews: () => void;
  // metadata
  metadata: ProductMetadata;
  setField: (key: keyof ProductMetadata, value: string) => void;
  // generation
  status: GenerationStatus;
  progress: number;
  stepIndex: number;
  pipelineIndex: number;
  generate: () => void;
  reset: () => void;
  // variants / product
  variantTab: VariantTab;
  setVariantTab: (t: VariantTab) => void;
  baseColor: string;
  setBaseColor: (c: string) => void;
  fabricId: string;
  setFabric: (id: string) => void;
  materialId: string;
  setMaterialPreset: (id: string) => void;
  logoId: string;
  setLogo: (id: string) => void;
  // render toggles
  toggles: RenderToggles;
  toggle: (key: keyof RenderToggles) => void;
  // material controls (Leva-backed)
  materials: Materials;
  setMaterials: (patch: Partial<Materials>) => void;
  resetMaterials: () => void;
  // shared three.js handles for export / screenshot
  viewerRef: MutableRefObject<ViewerApi | null>;
};

const StudioContext = createContext<StudioValue | null>(null);

function emptyViews(): ViewMap {
  return VIEW_ORDER.reduce((acc, { key }) => {
    acc[key] = { key, url: null };
    return acc;
  }, {} as ViewMap);
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [views, setViews] = useState<ViewMap>(emptyViews);
  const [uploadMode, setUploadModeState] = useState<UploadMode>("multi");
  const [metadata, setMetadata] = useState<ProductMetadata>(DEFAULT_METADATA);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [variantTab, setVariantTab] = useState<VariantTab>("color");
  const [baseColor, setBaseColor] = useState(DEFAULT_METADATA.color);
  const [fabricId, setFabricId] = useState(FABRIC_PRESETS[0].id);
  const [materialId, setMaterialId] = useState(MATERIAL_PRESETS[0].id);
  const [logoId, setLogoId] = useState("ev");
  const [toggles, setToggles] = useState<RenderToggles>({
    autoRotate: false, // static by default; the Rotate toolbar button spins it
    wireframe: false,
    normals: false,
    textures: true,
    ao: true,
    studio: true,
    pan: true,
    zoom: true,
    showDimensions: false,
  });

  const rafRef = useRef<number | null>(null);
  const objectUrls = useRef<Set<string>>(new Set());
  const viewerRef = useRef<ViewerApi | null>(null);

  // ── Material / render controls (plain state — light + fast) ──
  const [materials, setMaterialsState] = useState<Materials>(DEFAULT_MATERIALS);
  const setMaterials = useCallback(
    (patch: Partial<Materials>) =>
      setMaterialsState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetMaterials = useCallback(
    () => setMaterialsState(DEFAULT_MATERIALS),
    [],
  );

  // cleanup object URLs on unmount
  useEffect(() => {
    const urls = objectUrls.current;
    const raf = rafRef;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const addFile = useCallback((key: ViewKey, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    setViews((prev) => {
      const old = prev[key];
      if (old?.url) {
        URL.revokeObjectURL(old.url);
        objectUrls.current.delete(old.url);
      }
      return { ...prev, [key]: { key, url, sample: false } };
    });
  }, []);

  const setViewFromSample = useCallback((key: ViewKey, sample: SampleImage) => {
    setViews((prev) => {
      const old = prev[key];
      if (old?.url && objectUrls.current.has(old.url)) {
        URL.revokeObjectURL(old.url);
        objectUrls.current.delete(old.url);
      }
      return {
        ...prev,
        [key]: {
          key,
          url: sample.src ?? null,
          sample: !sample.src,
          name: sample.name,
          tint: sample.tint,
        },
      };
    });
  }, []);

  const removeView = useCallback((key: ViewKey) => {
    setViews((prev) => {
      const old = prev[key];
      if (old?.url) {
        URL.revokeObjectURL(old.url);
        objectUrls.current.delete(old.url);
      }
      return { ...prev, [key]: { key, url: null } };
    });
  }, []);

  const loadSamples = useCallback(() => {
    setViews((prev) => {
      const next = { ...prev };
      VIEW_ORDER.forEach(({ key }) => {
        if (next[key].url) {
          URL.revokeObjectURL(next[key].url as string);
          objectUrls.current.delete(next[key].url as string);
        }
        next[key] = { key, url: null, sample: true };
      });
      return next;
    });
  }, []);

  const clearViews = useCallback(() => {
    setViews((prev) => {
      Object.values(prev).forEach((v) => {
        if (v.url) {
          URL.revokeObjectURL(v.url);
          objectUrls.current.delete(v.url);
        }
      });
      return emptyViews();
    });
  }, []);

  const setUploadMode = useCallback(
    (mode: UploadMode) => {
      setUploadModeState(mode);
      // reset uploads + generation when switching modes for a clean flow
      setViews((prev) => {
        Object.values(prev).forEach((v) => {
          if (v.url && objectUrls.current.has(v.url)) {
            URL.revokeObjectURL(v.url);
            objectUrls.current.delete(v.url);
          }
        });
        return emptyViews();
      });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setStatus("idle");
      setProgress(0);
    },
    [],
  );

  const setField = useCallback(
    (key: keyof ProductMetadata, value: string) => {
      setMetadata((prev) => ({ ...prev, [key]: value }));
      if (key === "color") setBaseColor(value);
    },
    [],
  );

  const uploadedCount = useMemo(
    () => Object.values(views).filter((v) => v.url || v.sample).length,
    [views],
  );

  const generate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStatus("generating");
    setProgress(0);
    const duration = 6400;
    const start = performance.now();
    const loop = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        window.setTimeout(() => setStatus("ready"), 500);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStatus("idle");
    setProgress(0);
  }, []);

  const toggle = useCallback((key: keyof RenderToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setFabric = useCallback(
    (id: string) => {
      setFabricId(id);
      const preset = FABRIC_PRESETS.find((f) => f.id === id);
      if (preset) setMaterials({ roughness: preset.roughness, metalness: preset.metalness });
    },
    [setMaterials],
  );

  const setMaterialPreset = useCallback(
    (id: string) => {
      setMaterialId(id);
      const preset = MATERIAL_PRESETS.find((m) => m.id === id);
      if (preset) setMaterials({ roughness: preset.roughness, metalness: preset.metalness });
    },
    [setMaterials],
  );

  const setBaseColorAndMeta = useCallback((c: string) => {
    setBaseColor(c);
    setMetadata((prev) => ({ ...prev, color: c }));
  }, []);

  // reconstruction step (0..7) and pipeline step (0..7) derived from progress
  const stepIndex =
    status === "ready"
      ? RECONSTRUCTION_STEPS.length - 1
      : Math.min(
          RECONSTRUCTION_STEPS.length - 1,
          Math.floor((progress / 100) * RECONSTRUCTION_STEPS.length),
        );
  const PIPELINE_LEN = 6;
  const pipelineIndex =
    status === "ready"
      ? PIPELINE_LEN
      : status === "generating"
        ? Math.min(PIPELINE_LEN - 1, Math.floor((progress / 100) * PIPELINE_LEN))
        : -1;

  const value: StudioValue = {
    uploadMode,
    setUploadMode,
    views,
    uploadedCount,
    addFile,
    setViewFromSample,
    removeView,
    loadSamples,
    clearViews,
    metadata,
    setField,
    status,
    progress,
    stepIndex,
    pipelineIndex,
    generate,
    reset,
    variantTab,
    setVariantTab,
    baseColor,
    setBaseColor: setBaseColorAndMeta,
    fabricId,
    setFabric,
    materialId,
    setMaterialPreset,
    logoId,
    setLogo: setLogoId,
    toggles,
    toggle,
    materials,
    setMaterials,
    resetMaterials,
    viewerRef,
  };

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
