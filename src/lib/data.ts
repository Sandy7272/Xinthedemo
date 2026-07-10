import type { ComponentType, SVGProps } from "react";
import {
  IconLayers,
  IconSparkles,
  IconMesh,
  IconSwatch,
  IconCube,
  IconExport,
  IconTrend,
  IconEye,
  IconCart,
  IconShield,
  IconBolt,
  IconGrid,
  IconSofa,
  IconDevice,
  IconShirt,
  IconLamp,
} from "@/components/ui/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type Feature = {
  icon: Icon;
  title: string;
  description: string;
  step: string;
};

export const FEATURES: Feature[] = [
  {
    icon: IconLayers,
    title: "Multi-View Images",
    description:
      "Upload front, back, left, right, and top images. Richer coverage produces a more accurate reconstruction.",
    step: "01",
  },
  {
    icon: IconSparkles,
    title: "AI Reconstruction",
    description:
      "Your images are processed into a detailed 3D model, inferring depth, volume, and surface geometry.",
    step: "02",
  },
  {
    icon: IconMesh,
    title: "Mesh Optimization",
    description:
      "Automatic cleanup and topology refinement produce lightweight, watertight meshes ready for the web.",
    step: "03",
  },
  {
    icon: IconSwatch,
    title: "PBR Materials",
    description:
      "Generate high-quality albedo, roughness, metalness, and normal textures for physically realistic rendering.",
    step: "04",
  },
  {
    icon: IconCube,
    title: "Interactive Viewer",
    description:
      "Preview the final model directly in the browser with orbit controls, lighting, and real-time material tuning.",
    step: "05",
  },
  {
    icon: IconExport,
    title: "Export",
    description:
      "Ready for e-commerce, WebGL, and product configurators. Deliver glTF/GLB optimized for every device.",
    step: "06",
  },
];

/** Steps shown in the demo processing sequence. */
export const PROCESSING_STEPS = [
  "Processing…",
  "Generating Geometry…",
  "Creating Textures…",
  "Optimizing Mesh…",
  "Preparing Viewer…",
] as const;

/** Steps shown in the virtual try-on loading sequence. */
export const TRYON_STEPS = [
  "Analyzing Image…",
  "Detecting Human Pose…",
  "Preparing Product…",
  "Generating Preview…",
] as const;

export type Benefit = {
  icon: Icon;
  title: string;
  description: string;
};

export const BENEFITS: Benefit[] = [
  {
    icon: IconShield,
    title: "Lower Product Returns",
    description:
      "Shoppers see exactly what they're buying — accurate scale, materials, and detail reduce mismatched expectations.",
  },
  {
    icon: IconEye,
    title: "Interactive Shopping",
    description:
      "Customers rotate, zoom, and inspect products from every angle, right inside the product page.",
  },
  {
    icon: IconTrend,
    title: "Higher Conversion Rates",
    description:
      "Interactive 3D product pages consistently outperform static imagery on add-to-cart and checkout.",
  },
  {
    icon: IconCube,
    title: "Immersive Product Experience",
    description:
      "Bring products to life with real-time lighting, reflections, and AR-ready assets.",
  },
  {
    icon: IconShield,
    title: "Better Customer Confidence",
    description:
      "Transparency builds trust. A tangible preview turns hesitation into a confident purchase.",
  },
  {
    icon: IconBolt,
    title: "Fast Product Digitization",
    description:
      "Turn a handful of photos into a production-ready 3D asset in a streamlined, repeatable workflow.",
  },
  {
    icon: IconGrid,
    title: "Premium Online Catalogs",
    description:
      "Build a consistent, high-end catalog where every SKU is explorable in interactive 3D.",
  },
];

export type SkillGroup = {
  label: string;
  skills: string[];
};

/** Grouped for visual rhythm; rendered as a single flowing tag cloud. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: "3D & Rendering",
    skills: [
      "Three.js",
      "WebGL",
      "Real-Time Rendering",
      "GLTF",
      "PBR",
      "HDRI",
      "Interactive 3D",
    ],
  },
  {
    label: "AI & Capture",
    skills: [
      "Image-to-3D",
      "Gaussian Splatting",
      "NeRF",
      "Photogrammetry",
      "AI Workflow",
    ],
  },
  {
    label: "Frontend",
    skills: ["React", "TypeScript", "Next.js"],
  },
  {
    label: "Content & Product",
    skills: [
      "Blender",
      "Substance Painter",
      "Product Visualization",
    ],
  },
];

/** Flat list for the tag cloud rendering. */
export const ALL_SKILLS: string[] = [
  "Three.js",
  "React",
  "TypeScript",
  "Next.js",
  "WebGL",
  "GLTF",
  "PBR",
  "HDRI",
  "Image-to-3D",
  "Gaussian Splatting",
  "NeRF",
  "Photogrammetry",
  "Blender",
  "Substance Painter",
  "Interactive 3D",
  "AI Workflow",
  "Real-Time Rendering",
  "Product Visualization",
];

/** Category → icon map for the portfolio showcase cards. */
export const CATEGORY_ICONS: Record<string, Icon> = {
  Furniture: IconSofa,
  Electronics: IconDevice,
  Fashion: IconShirt,
  "Home Decor": IconLamp,
};
