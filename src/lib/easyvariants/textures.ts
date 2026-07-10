import * as THREE from "three";

/**
 * Procedural fabric + logo textures generated on a canvas — no external
 * assets required. Used to give the procedural garment a believable knit
 * surface and a swappable chest logo.
 */

/** Generates a tangent-space normal map that mimics a ribbed knit fabric. */
export function createKnitNormalMap(size = 256): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(size, size);
  const data = image.data;
  const rib = (size / 22) * Math.PI; // rib frequency

  const height = (x: number, y: number) => {
    // two crossing rib patterns + fine grain
    const a = Math.sin((x + y) / size * rib);
    const b = Math.sin((x - y) / size * rib * 0.5);
    const grain = Math.sin(x * 1.7) * Math.cos(y * 1.7) * 0.15;
    return a * 0.5 + b * 0.3 + grain;
  };

  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hL = height(x - 1, y);
      const hR = height(x + 1, y);
      const hU = height(x, y - 1);
      const hD = height(x, y + 1);
      let nx = (hL - hR) * strength;
      let ny = (hU - hD) * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      const nzn = nz / len;
      const i = (y * size + x) * 4;
      data[i] = (nx * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * 0.5 + 0.5) * 255;
      data[i + 2] = (nzn * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

/** Renders a monogram/logo onto a transparent canvas texture. */
export function createLogoTexture(
  monogram: string,
  size = 256,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined" || !monogram) return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${size * 0.42}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(monogram, size / 2, size / 2 + size * 0.02);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.anisotropy = 4;
  return texture;
}
