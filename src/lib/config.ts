/**
 * ─────────────────────────────────────────────────────────────
 *  DEMO CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  This is the single place to plug in your own 3D assets.
 *
 *  1. MODEL_URL       → the hero/demo model shown in the viewer.
 *  2. PORTFOLIO_MODELS → the "Open Model" links in the showcase.
 *
 *  Leave MODEL_URL as the placeholder to render a built-in,
 *  fully-interactive procedural PBR model (works offline, no
 *  network required). Swap in a real .glb/.gltf URL and the
 *  viewer will load it automatically.
 * ─────────────────────────────────────────────────────────────
 */

/** Replace with your hosted .glb / .gltf URL, e.g. from a CDN or /public. */
export const MODEL_URL: string = "YOUR_GLB_URL";

/** True while MODEL_URL still holds the placeholder value. */
export const MODEL_URL_IS_PLACEHOLDER =
  !MODEL_URL || MODEL_URL === "YOUR_GLB_URL" || MODEL_URL.trim() === "";

export type PortfolioModel = {
  id: string;
  category: string;
  title: string;
  status: "Completed";
  /** The link opened by the "Open Model" button. Replace with your own. */
  modelUrl: string;
  accent: string;
  description: string;
};

/**
 * Portfolio showcase entries. Replace each `modelUrl` with your own
 * hosted model link (Sketchfab, a hosted viewer, a .glb, etc.).
 */
export const PORTFOLIO_MODELS: PortfolioModel[] = [
  {
    id: "furniture",
    category: "Furniture",
    title: "Lounge Chair · Oak & Wool",
    status: "Completed",
    modelUrl: "YOUR_MODEL_LINK_FURNITURE",
    accent: "#c98a4b",
    description:
      "Reconstructed from 6 studio photographs. Optimized to 24k triangles with baked PBR maps.",
  },
  {
    id: "electronics",
    category: "Electronics",
    title: "Wireless Headphones",
    status: "Completed",
    modelUrl: "YOUR_MODEL_LINK_ELECTRONICS",
    accent: "#3366ff",
    description:
      "Multi-view capture with metallic + matte materials. Ready for a product configurator.",
  },
  {
    id: "fashion",
    category: "Fashion",
    title: "Performance Sneaker",
    status: "Completed",
    modelUrl: "YOUR_MODEL_LINK_FASHION",
    accent: "#e5484d",
    description:
      "Fabric, mesh, and rubber materials separated into swappable texture sets.",
  },
  {
    id: "home-decor",
    category: "Home Decor",
    title: "Ceramic Table Lamp",
    status: "Completed",
    modelUrl: "YOUR_MODEL_LINK_HOME_DECOR",
    accent: "#12b76a",
    description:
      "Translucent shade with emissive materials for realistic lighting preview.",
  },
];

/** Contact / footer links — replace with your own. */
export const SITE = {
  name: "Image-to-3D Studio",
  authorHandle: "@your-handle",
  githubUrl: "https://github.com/your-handle",
  email: "you@example.com",
};
