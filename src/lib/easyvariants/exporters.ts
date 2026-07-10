import * as THREE from "three";
import { GLTFExporter, OBJExporter, USDZExporter } from "three-stdlib";
import type { ProductMetadata } from "./types";

/** Triggers a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Triggers a download from a data URL (used for screenshots). */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportGLB(object: THREE.Object3D): Promise<Blob> {
  const exporter = new GLTFExporter();
  const result = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      object,
      (gltf) => resolve(gltf as ArrayBuffer),
      (error) => reject(error),
      { binary: true, onlyVisible: true },
    );
  });
  return new Blob([result], { type: "model/gltf-binary" });
}

export function exportOBJ(object: THREE.Object3D): Blob {
  const exporter = new OBJExporter();
  const text = exporter.parse(object);
  return new Blob([text], { type: "text/plain" });
}

export async function exportUSDZ(object: THREE.Object3D): Promise<Blob> {
  const exporter = new USDZExporter();
  // three-stdlib exposes parseAsync on recent versions; fall back to parse.
  const anyExp = exporter as unknown as {
    parseAsync?: (scene: THREE.Object3D) => Promise<Uint8Array>;
    parse: (scene: THREE.Object3D) => Promise<Uint8Array> | Uint8Array;
  };
  const data = anyExp.parseAsync
    ? await anyExp.parseAsync(object)
    : await anyExp.parse(object);
  return new Blob([data as BlobPart], { type: "model/vnd.usdz+zip" });
}

/** Builds the metadata JSON payload delivered alongside the mesh. */
export function buildMetadataJson(
  metadata: ProductMetadata,
  extra: Record<string, unknown> = {},
) {
  return JSON.stringify(
    {
      generator: "EasyVariants Variant Studio",
      exportedAt: new Date().toISOString(),
      product: metadata,
      ...extra,
    },
    null,
    2,
  );
}
