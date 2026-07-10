import type {
  ViewKey,
  ProductMetadata,
  PipelineStepId,
  FabricPreset,
  MaterialPreset,
  ExportFormat,
  HistoryItem,
  DimensionGuide,
} from "./types";

/**
 * ─────────────────────────────────────────────────────────────
 *  EASYVARIANTS STUDIO — CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  Replace SWEATSHIRT_GLB_URL with a hosted .glb to load a real
 *  garment. Left as the placeholder, the viewer renders a built-in
 *  procedural sweatshirt (fully interactive, works offline).
 * ─────────────────────────────────────────────────────────────
 */
export const SWEATSHIRT_GLB_URL: string = "/samples/red_shirt.glb";

/** Local Draco decoder (copied from three/examples) — keeps the demo offline-capable. */
export const DRACO_DECODER_PATH = "/draco/";

export const GLB_IS_PLACEHOLDER =
  !SWEATSHIRT_GLB_URL ||
  SWEATSHIRT_GLB_URL === "YOUR_SWEATSHIRT_GLB_URL" ||
  SWEATSHIRT_GLB_URL.trim() === "";

/**
 * ── PRODUCT CATALOG ────────────────────────────────────────
 * The selectable sample products in the gallery. Each one drives the whole
 * flow: its `image` shows in the gallery + try-on, and its `glbUrl` is the
 * 3D asset loaded on the model step. Drop a `.glb` in `public/samples/` and a
 * product shot next to it, then add an entry here to add a new product.
 */
export type StudioProduct = {
  id: string;
  /** Short display name shown on the gallery card. */
  label: string;
  /** File-style name used as the selection signal / shown under the model. */
  name: string;
  /** Product shot — gallery thumbnail + try-on "Product" image. */
  image: string;
  /** The 3D asset loaded on the model + variants steps. */
  glbUrl: string;
  /** Gradient tint used for the fallback tile when the image is missing. */
  tint: string;
};

export const PRODUCTS: StudioProduct[] = [
  {
    id: "red-shirt",
    label: "Red Sweatshirt",
    name: "xinthe-red-front.png",
    image: "/samples/product-xinthe-red.png",
    glbUrl: "/samples/red_shirt.glb",
    tint: "#fdeceb",
  },
  {
    id: "cap",
    label: "Classic Cap",
    name: "cap-front.png",
    image: "/samples/cap.webp",
    glbUrl: "/samples/cap.glb",
    tint: "#eef4ff",
  },
];

export const DEFAULT_PRODUCT = PRODUCTS[0];

export const BRAND = {
  name: "EasyVariants",
  product: "Variant Studio",
  url: "https://www.easyvariants.com",
  tagline: "Multi-view product digitization for e-commerce",
};

/**
 * ── APPLICANT ──────────────────────────────────────────────
 * Shown to recruiters so the context is unmistakable. Replace
 * with your details before sharing.
 */
export const APPLICANT = {
  name: "Sandesh Gadakh",
  role: "Image-to-3D · 3D Web Engineer",
  pitch: "A working image-to-3D demo, prepared for the EasyVariants role",
  email: "you@example.com",
  portfolioUrl: "#",
  githubUrl: "#",
  linkedinUrl: "#",
};

/**
 * ── SAMPLE IMAGES (fake file explorer) ─────────────────────
 * The images shown in the in-app file picker. Drop your own
 * images into `public/samples/` and point `src` at them
 * (e.g. "/samples/hoodie-front.png"). If a `src` is missing or
 * fails to load, a labelled gradient tile is shown instead — so
 * the picker always looks complete.
 */
export type SampleImage = {
  id: string;
  name: string;
  src?: string;
  tint: string;
  view?: ViewKey;
  /** For try-on person images: the generated result per product id
   *  (e.g. red-shirt → model1_.webp, cap → model1__.webp). */
  results?: Record<string, string>;
};

export const SAMPLE_PRODUCT_IMAGES: SampleImage[] = [
  { id: "xinthe-front", name: "xinthe-red-front.png", view: "front", tint: "#fdeceb", src: "/samples/product-xinthe-red.png" },
  { id: "back", name: "sweatshirt-back.png", view: "back", tint: "#f0f7f2", src: "/samples/sweatshirt-back.png" },
  { id: "left", name: "sweatshirt-left.png", view: "left", tint: "#fdf3ef", src: "/samples/sweatshirt-left.png" },
  { id: "right", name: "sweatshirt-right.png", view: "right", tint: "#f5f0fb", src: "/samples/sweatshirt-right.png" },
  { id: "top", name: "sweatshirt-top.png", view: "top", tint: "#eef7fb", src: "/samples/sweatshirt-top.png" },
  { id: "bottom", name: "sweatshirt-bottom.png", view: "bottom", tint: "#fbf6ee", src: "/samples/sweatshirt-bottom.png" },
  { id: "on-model", name: "xinthe-on-model.png", tint: "#fdeceb", src: "/samples/after.png" },
  { id: "flat", name: "product-flatlay.png", tint: "#f4f4f5", src: "/samples/product-flatlay.png" },
];

export const SAMPLE_PERSON_IMAGES: SampleImage[] = [
  {
    id: "model1",
    name: "model1.webp",
    tint: "#fbe4e4",
    src: "/samples/model1.webp",
    results: {
      "red-shirt": "/samples/model1_.webp",
      cap: "/samples/model1__.webp",
    },
  },
  {
    id: "model2",
    name: "model2.webp",
    tint: "#efe6fb",
    src: "/samples/model2.webp",
    results: {
      "red-shirt": "/samples/model2_.webp",
      cap: "/samples/model2__.webp",
    },
  },
];

/**
 * ── VIRTUAL TRY-ON ─────────────────────────────────────────
 * Point these at real image paths once the product / result assets are ready.
 * `null` renders a neutral placeholder so the flow still demos end-to-end.
 */
export const TRYON: { garmentImage: string | null; resultImage: string | null } = {
  garmentImage: "/samples/product-xinthe-red.png", // the product being tried on
  resultImage: "/samples/after.png", // the try-on result (person wearing the product)
};

export const VIEW_ORDER: { key: ViewKey; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
];

export const DEFAULT_METADATA: ProductMetadata = {
  height: "72",
  width: "58",
  depth: "20",
  thickness: "2.5",
  fabric: "Cotton",
  sleeveType: "Full Sleeve",
  fitType: "Regular",
  neckType: "Round Neck",
  weight: "480",
  category: "Sweatshirt",
  color: "original", // "original" = show the GLB's authored texture untinted
  brand: "EasyVariants",
};

export const METADATA_FIELDS: {
  key: keyof ProductMetadata;
  label: string;
  unit?: string;
  type: "number" | "text" | "select";
  options?: string[];
}[] = [
  { key: "height", label: "Height", unit: "cm", type: "number" },
  { key: "width", label: "Width", unit: "cm", type: "number" },
  { key: "depth", label: "Depth", unit: "cm", type: "number" },
  { key: "thickness", label: "Thickness", unit: "cm", type: "number" },
  {
    key: "fabric",
    label: "Fabric Type",
    type: "select",
    options: ["Cotton", "Fleece", "French Terry", "Polyester", "Merino Wool"],
  },
  {
    key: "sleeveType",
    label: "Sleeve Type",
    type: "select",
    options: ["Full Sleeve", "Half Sleeve", "Sleeveless"],
  },
  {
    key: "fitType",
    label: "Fit Type",
    type: "select",
    options: ["Regular", "Slim", "Oversized", "Relaxed"],
  },
  {
    key: "neckType",
    label: "Neck Type",
    type: "select",
    options: ["Round Neck", "Crew Neck", "V-Neck", "Hooded"],
  },
  { key: "weight", label: "Weight", unit: "g", type: "number" },
];

export const PIPELINE_STEPS: { id: PipelineStepId; label: string }[] = [
  { id: "upload", label: "Upload Views" },
  { id: "metadata", label: "Metadata" },
  { id: "reconstruction", label: "Reconstruction" },
  { id: "texturing", label: "Texturing" },
  { id: "optimization", label: "Optimization" },
  { id: "export", label: "Export" },
];

/** The simulated Image-to-3D reconstruction pipeline (demo only). */
export const RECONSTRUCTION_STEPS = [
  "Detecting Product",
  "Segmenting Background",
  "Extracting Features",
  "Multi-view Alignment",
  "Geometry Reconstruction",
  "UV Generation",
  "Texture Baking",
  "Mesh Optimization",
  "Exporting GLB",
] as const;

/** Demo stats shown in the Model Information panel (pre-generated asset). */
export const MODEL_INFO: { label: string; value: string }[] = [
  { label: "Vertices", value: "58,241" },
  { label: "Triangles", value: "104,332" },
  { label: "File size", value: "6.4 MB" },
  { label: "Textures", value: "2048 × 2048" },
  { label: "Materials", value: "4" },
  { label: "Compression", value: "Draco" },
  { label: "Format", value: "GLB · glTF 2.0" },
  { label: "Render", value: "60 FPS" },
];

/** Front-end stack shown in the Technology section. */
export const TECH_STACK: string[] = [
  "Three.js",
  "React",
  "TypeScript",
  "glTF / GLB",
  "PBR",
  "HDRI",
  "Draco",
  "WebGL",
  "Framer Motion",
  "Responsive",
  "Modern UI",
];

export const COLOR_SWATCHES: { name: string; value: string }[] = [
  { name: "Red", value: "#d92d20" },
  { name: "Cobalt", value: "#3366ff" },
  { name: "Ink", value: "#0a0a0b" },
  { name: "Slate", value: "#4b5563" },
  { name: "Sand", value: "#d6c7a1" },
  { name: "Clay", value: "#c05621" },
  { name: "Forest", value: "#15803d" },
  { name: "Wine", value: "#9d174d" },
  { name: "Snow", value: "#f4f4f5" },
];

export const FABRIC_PRESETS: FabricPreset[] = [
  { id: "fleece", name: "Cotton Fleece", roughness: 0.92, metalness: 0.0, normalScale: 1.0, sheen: 0.15 },
  { id: "terry", name: "French Terry", roughness: 0.85, metalness: 0.0, normalScale: 0.7, sheen: 0.1 },
  { id: "poly", name: "Tech Polyester", roughness: 0.55, metalness: 0.05, normalScale: 0.4, sheen: 0.45 },
  { id: "wool", name: "Merino Wool", roughness: 0.98, metalness: 0.0, normalScale: 1.3, sheen: 0.2 },
];

export const MATERIAL_PRESETS: MaterialPreset[] = [
  { id: "matte", name: "Matte", roughness: 0.95, metalness: 0.0 },
  { id: "soft", name: "Soft Touch", roughness: 0.75, metalness: 0.0 },
  { id: "satin", name: "Satin", roughness: 0.45, metalness: 0.1 },
  { id: "coated", name: "Coated", roughness: 0.25, metalness: 0.2 },
];

export const LOGO_OPTIONS: { id: string; name: string; monogram: string; color: string }[] = [
  { id: "none", name: "None", monogram: "", color: "#ffffff" },
  { id: "ev", name: "EasyVariants", monogram: "EV", color: "#ffffff" },
  { id: "star", name: "Star", monogram: "★", color: "#ffffff" },
  { id: "circle", name: "Circle", monogram: "◉", color: "#ffffff" },
];

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: "glb", label: "GLB", ext: "glb", description: "glTF binary · web + AR ready", supported: true },
  { id: "usdz", label: "USDZ", ext: "usdz", description: "Apple AR Quick Look", supported: true },
  { id: "obj", label: "OBJ", ext: "obj", description: "Universal mesh format", supported: true },
  { id: "fbx", label: "FBX", ext: "fbx", description: "DCC / animation pipelines", supported: false },
];

export const DIMENSION_GUIDES: DimensionGuide[] = [
  { id: "height", label: "Height", value: "72 cm" },
  { id: "width", label: "Width", value: "58 cm" },
  { id: "depth", label: "Depth", value: "12 cm" },
  { id: "sleeve", label: "Sleeve", value: "64 cm" },
  { id: "neck", label: "Neck", value: "20 cm" },
];

export const HISTORY_ITEMS: HistoryItem[] = [
  { id: "h1", name: "Navy EV Sweatshirt", category: "Sweatshirt", status: "Completed", date: "May 19, 2025", size: "24.6 MB", accent: "#22315f" },
  { id: "h2", name: "Black EV Sweatshirt", category: "Sweatshirt", status: "Completed", date: "May 18, 2025", size: "23.1 MB", accent: "#0a0a0b" },
  { id: "h3", name: "White EV T-Shirt", category: "T-Shirt", status: "Processing", date: "May 18, 2025", size: "—", accent: "#c9ced9" },
  { id: "h4", name: "Red EV Hoodie", category: "Hoodie", status: "Failed", date: "May 17, 2025", size: "—", accent: "#e5484d" },
];
