/** Shared domain types for the EasyVariants studio dashboard. */

export type ViewKey =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom";

export type UploadedView = {
  key: ViewKey;
  url: string | null; // object URL / sample path, null = empty slot
  sample?: boolean;
  name?: string; // display filename
  tint?: string; // fallback gradient colour if the image can't load
};

export type ProductMetadata = {
  height: string;
  width: string;
  depth: string;
  thickness: string;
  fabric: string;
  sleeveType: string;
  fitType: string;
  neckType: string;
  weight: string;
  category: string;
  color: string;
  brand: string;
};

export type GenerationStatus = "idle" | "generating" | "ready";

export type PipelineStepId =
  | "upload"
  | "metadata"
  | "reconstruction"
  | "texturing"
  | "optimization"
  | "export";

export type VariantTab = "color" | "material" | "logo" | "fabric";

export type FabricPreset = {
  id: string;
  name: string;
  roughness: number;
  metalness: number;
  /** Normal-map intensity proxy for the procedural fabric look. */
  normalScale: number;
  sheen: number;
};

export type MaterialPreset = {
  id: string;
  name: string;
  roughness: number;
  metalness: number;
};

export type ExportFormat = {
  id: "glb" | "usdz" | "obj" | "fbx";
  label: string;
  ext: string;
  description: string;
  /** true = a real client-side export is implemented, false = queued mock. */
  supported: boolean;
};

export type HistoryItem = {
  id: string;
  name: string;
  category: string;
  status: "Completed" | "Processing" | "Failed";
  date: string; // display date
  size: string; // display size
  accent: string;
};

export type DimensionGuide = {
  id: string;
  label: string;
  value: string;
};
