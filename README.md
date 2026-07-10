# Xinthe — Image-to-3D Variant Studio

A production-quality frontend demo of an **AI Image-to-3D product workflow**: pick a product image, watch a reconstruction pipeline build the mesh, inspect the result in a real-time PBR viewer, customize variants, and preview it with a virtual try-on.

> **Frontend demonstration.** The reconstruction pipeline is simulated in the browser against pre-generated 3D assets — no backend, no AI inference, no data leaves the device. Built to showcase product thinking, UI craft, and 3D web engineering.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Three.js (`@react-three/fiber` + `@react-three/drei`) · Framer Motion · Draco · WebGL post-processing.

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | Marketing landing page for the studio. |
| `/dashboard` | **Variant Studio** — the guided 5-step demo. *This is the one to share.* |

## The guided studio flow (`/dashboard`)

1. **Gallery** — choose a sample product (red sweatshirt or classic cap) or upload your own image.
2. **Reconstruct** — an animated 9-stage Image-to-3D pipeline (detection → segmentation → geometry → texture baking → GLB export).
3. **3D Model** — the real Draco-compressed GLB in an interactive viewer: orbit/pan/zoom, wireframe, texture toggle, HDRI environments, screenshot, fullscreen, resolution presets.
4. **Variants** — recolor via a GPU luminance-tint shader (keeps fabric detail clean), fabric presets, logo options — the model updates live.
5. **Try-On** — pick a person photo and preview the selected product worn on the model.

### Product catalog

Products are defined in [`src/lib/easyvariants/config.ts`](src/lib/easyvariants/config.ts) → `PRODUCTS`. Each entry ties together the gallery image, the 3D asset, and the try-on shot:

```ts
{
  id: "cap",
  label: "Classic Cap",
  image: "/samples/cap.webp",   // gallery thumbnail + try-on product
  glbUrl: "/samples/cap.glb",   // Draco-compressed 3D asset
  ...
}
```

To add a product: drop a `.glb` + product photo into `public/samples/`, add a `PRODUCTS` entry, and (optionally) add per-product try-on results to `SAMPLE_PERSON_IMAGES[].results`.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # TypeScript, no emit
npm run lint       # ESLint
```

## Deploy

Zero-config on **Vercel**: import the repo, framework preset “Next.js”, no environment variables needed. All 3D assets and the Draco decoder are served from `public/`, so the demo is fully self-contained.

---

## Engineering highlights

- **Draco-decoded GLBs** with a locally hosted decoder (`public/draco/`) — no CDN dependency, works offline.
- **Non-destructive recoloring** — a ~15-line GLSL patch (`onBeforeCompile`) tints by the base map's luminance, so any color stays clean while fabric shading is preserved; “Original” renders the authored texture untouched.
- **Live lighting environments** — softbox `Lightformer` rigs per preset; reflections without external HDR downloads.
- **Perf-aware viewer** — lazy-loaded canvas (`next/dynamic`), adaptive DPR with a performance monitor, N8AO + bloom post-processing.
- **Fully client-side** — uploads use object URLs; nothing is transmitted.

## Project structure

```
src/
├── app/                        # App Router: / and /dashboard
├── components/
│   ├── dashboard/
│   │   ├── wizard/             # Guided flow: steps, context, gallery, processing
│   │   ├── viewer/             # ProductViewer, ProductScene, GarmentModel (GLB + tint shader)
│   │   ├── VariantPanel.tsx    # Color / fabric / logo controls
│   │   └── VirtualTryOnPanel.tsx
│   └── …                       # Landing page sections
└── lib/easyvariants/config.ts  # ← products, samples, presets, branding
```
