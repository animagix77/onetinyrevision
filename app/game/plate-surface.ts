import * as T from "three";
import type { Food } from "./rules";

// Sample the upper faces of the actual food once. Both sauces use the same
// surface, independent of camera angle, screen size, or submission order.
const edge = 2.5,
  cells = 144,
  stride = cells + 1,
  step = (edge * 2) / cells;
function china(x: number, z: number) {
  const r = Math.hypot(x, z);
  return (
    0.18 +
    Math.max(0, Math.min(0.49, r - 1.65)) * (0.12 / 0.49) +
    Math.max(0, Math.min(0.16, r - 2.14)) * (0.06 / 0.16)
  );
}
export class PlateSurface {
  private heights = new Float32Array(stride * stride);
  private turkey?: Uint8Array;
  add(model: T.Object3D, layer: "food" | "turkey" | "gravy" = "food") {
    if (layer === "turkey") this.turkey ??= new Uint8Array(stride * stride);
    let touchesTurkey = false;
    model.updateWorldMatrix(true, true);
    const point = new T.Vector3();
    model.traverse((part) => {
      if (!(part instanceof T.Mesh)) return;
      const { geometry } = part,
        pos = geometry.getAttribute("position"),
        index = geometry.index;
      const vertices = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        point.fromBufferAttribute(pos, i).applyMatrix4(part.matrixWorld);
        vertices[i * 3] = (point.x + edge) / step;
        vertices[i * 3 + 1] = point.y;
        vertices[i * 3 + 2] = (point.z + edge) / step;
      }
      const count = index ? index.count : pos.count;
      for (let i = 0; i < count; i += 3) {
        const a = 3 * (index ? index.getX(i) : i),
          b = 3 * (index ? index.getX(i + 1) : i + 1),
          c = 3 * (index ? index.getX(i + 2) : i + 2);
        const ax = vertices[a],
          az = vertices[a + 2];
        const bx = vertices[b] - ax,
          bz = vertices[b + 2] - az,
          cx = vertices[c] - ax,
          cz = vertices[c + 2] - az;
        const det = bx * cz - bz * cx;
        if (det >= -0.00001) continue; // upward facing triangles
        const x0 = Math.max(0, Math.ceil(ax + Math.min(0, bx, cx))),
          x1 = Math.min(cells, Math.floor(ax + Math.max(0, bx, cx)));
        const z0 = Math.max(0, Math.ceil(az + Math.min(0, bz, cz))),
          z1 = Math.min(cells, Math.floor(az + Math.max(0, bz, cz)));
        const ay = vertices[a + 1],
          by = vertices[b + 1] - ay,
          cy = vertices[c + 1] - ay;
        for (let z = z0; z <= z1; z++)
          for (let x = x0; x <= x1; x++) {
            const u = ((x - ax) * cz - (z - az) * cx) / det;
            const v = (bx * (z - az) - bz * (x - ax)) / det;
            if (u < 0 || v < 0 || u + v > 1) continue;
            const k = z * stride + x;
            const height = ay + u * by + v * cy;
            if (height < this.heights[k]) continue;
            if (this.turkey) {
              if (layer === "gravy" && this.turkey[k]) touchesTurkey = true;
              this.turkey[k] = layer === "turkey" ? 1 : 0;
            }
            this.heights[k] = height;
          }
      }
    });
    return touchesTurkey;
  }
  at(x: number, z: number) {
    const xx = T.MathUtils.clamp((x + edge) / step, 0, cells - 0.001);
    const zz = T.MathUtils.clamp((z + edge) / step, 0, cells - 0.001);
    const k = Math.floor(zz) * stride + Math.floor(xx),
      floor = china(x, z);
    const h = (i: number) => Math.max(floor, this.heights[i]);
    return T.MathUtils.lerp(
      T.MathUtils.lerp(h(k), h(k + 1), xx % 1),
      T.MathUtils.lerp(h(k + stride), h(k + stride + 1), xx % 1),
      zz % 1,
    );
  }
}

const gravyMaterial = new T.MeshStandardMaterial({
  color: "#92502c",
  roughness: 0.22,
  metalness: 0.03,
  side: T.DoubleSide,
});
export function gravyPour(f: Food, surface: PlateSurface) {
  const sectors = 48,
    rings = 16,
    positions: number[] = [],
    indices: number[] = [];
  const center = surface.at(f.x, f.z),
    phase = f.x * 4 + f.z * 7;
  positions.push(0, center + 0.055, 0);
  const lengths = Array.from({ length: sectors }, (_, i) => {
    const a = (2 * Math.PI * i) / sectors,
      dx = Math.cos(a),
      dz = Math.sin(a);
    const radius =
      f.size *
      (0.45 +
        0.028 * Math.sin(3 * a + phase) +
        0.022 * Math.cos(5 * a - phase));
    // The sauce travels farther downhill and stops against the raised lip.
    const drop = center - surface.at(f.x + dx * radius, f.z + dz * radius);
    const outward = f.x * dx + f.z * dz;
    const lip =
      -outward +
      Math.sqrt(
        Math.max(0, outward * outward + 2.305 ** 2 - f.x ** 2 - f.z ** 2),
      );
    return Math.min(
      lip,
      radius * (1 + T.MathUtils.clamp(drop * 0.85, -0.4, 0.55)),
    );
  });
  for (let j = 1; j <= rings; j++) {
    const t = j / rings;
    for (let i = 0; i < sectors; i++) {
      const a = (i * Math.PI * 2) / sectors,
        dx = Math.cos(a) * lengths[i] * t,
        dz = Math.sin(a) * lengths[i] * t;
      const height = surface.at(f.x + dx, f.z + dz);
      positions.push(dx, height + 0.009 + 0.046 * (1 - t * t), dz);
      const n = 1 + (j - 1) * sectors + i,
        next = 1 + (j - 1) * sectors + ((i + 1) % sectors);
      if (j === 1) indices.push(0, next, n);
      else
        indices.push(n - sectors, next, n, n - sectors, next - sectors, next);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const pool = new T.Mesh(geometry, gravyMaterial);
  pool.position.set(f.x, 0, f.z);
  pool.receiveShadow = true;
  return pool;
}
