import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Food, Plate } from "./rules";
type Group = T.Object3D;
const materials = new Map<string, T.MeshStandardMaterial>();
function mat(c: string) {
  let m = materials.get(c);
  if (!m) {
    m = new T.MeshStandardMaterial({
      color: c,
      roughness: 0.79,
      flatShading: true,
    });
    materials.set(c, m);
  }
  return m;
}
function mesh(
  g: Group,
  geo: T.BufferGeometry,
  c: string,
  x: number,
  y: number,
  z: number,
) {
  const m = new T.Mesh(geo, mat(c));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function oval(
  g: Group,
  c: string,
  x: number,
  y: number,
  z: number,
  a: number,
  b: number,
  d: number,
  detail = 1,
) {
  const m = mesh(g, new T.IcosahedronGeometry(1, detail), c, x, y, z);
  m.scale.set(a, b, d);
  return m;
}
function box(
  g: Group,
  c: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  r = 0.04,
) {
  return mesh(g, new RoundedBoxGeometry(w, h, d, 1, r), c, x, y, z);
}
function rod(
  g: Group,
  c: string,
  a: number[],
  b: number[],
  ra: number,
  rb = ra,
  n = 8,
) {
  let v = new T.Vector3(...a),
    w = new T.Vector3(...b),
    delta = w.clone().sub(v);
  let m = mesh(
    g,
    new T.CylinderGeometry(rb, ra, delta.length(), n),
    c,
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
    (a[2] + b[2]) / 2,
  );
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  return m;
}
function shape(
  g: Group,
  c: string,
  pts: number[][],
  depth: number,
  x: number,
  y: number,
  z: number,
) {
  let s = new T.Shape();
  pts.forEach(([a, b], i) => (i ? s.lineTo(a, b) : s.moveTo(a, b)));
  s.closePath();
  const m = mesh(
    g,
    new T.ExtrudeGeometry(s, { depth, bevelEnabled: false }),
    c,
    x,
    y,
    z,
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}
function sprig(
  g: Group,
  x: number,
  y: number,
  z: number,
  rot: number,
  scale = 1,
) {
  const p = new T.Group();
  p.position.set(x, y, z);
  p.rotation.y = rot;
  p.scale.setScalar(scale);
  g.add(p);
  rod(p, "#556530", [0, 0, 0], [0, 0.08, 0.8], 0.018);
  for (let i = 0; i < 6; i++)
    for (const sign of [-1, 1]) {
      const leaf = oval(
        p,
        i % 2 ? "#738746" : "#485f37",
        sign * 0.09,
        0.05 + i * 0.012,
        0.12 * i + 0.06,
        0.045,
        0.025,
        0.16,
        0,
      );
      leaf.rotation.y = sign * 0.76;
    }
}
function berry(g: Group, x: number, y: number, z: number, s = 0.105) {
  oval(g, "#ae2534", x, y, z, s, s * 0.96, s);
  oval(g, "#672831", x, y + s * 0.9, z, 0.025, 0.012, 0.025, 0);
}
function roast(g: Group, n: number) {
  const bird = new T.Group();
  bird.position.set(-0.18, 0.37, -0.06);
  bird.rotation.y = -0.22;
  g.add(bird);
  const body = oval(bird, "#cc6f31", -0.05, 0.83, -0.07, 1.16, 0.91, 1.55, 2);
  const pos = body.geometry.attributes.position,
    cols = [];
  for (let i = 0; i < pos.count; i += 3) {
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const shade = new T.Color(y > 0.35 ? "#bf6228" : "#cf7940").multiplyScalar(
      0.94 + 0.06 * Math.sin(i * 4.11),
    );
    for (let j = 0; j < 3; j++) cols.push(shade.r, shade.g, shade.b);
  }
  body.geometry.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
  body.material = new T.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.48,
    flatShading: true,
  });
  for (const s of [-1, 1]) {
    const leg = oval(
      bird,
      "#c46b33",
      s * 0.91,
      0.63,
      0.63,
      0.48,
      0.49,
      0.79,
      2,
    );
    leg.rotation.x = -0.34;
    leg.rotation.y = s * 0.38;
    rod(
      bird,
      "#b36634",
      [s * 0.97, 0.67, 0.79],
      [s * 1.32, 1.02, 1.54],
      0.36,
      0.145,
      11,
    );
    rod(
      bird,
      "#ffedcc",
      [s * 1.3, 1, 1.51],
      [s * 1.44, 1.2, 1.78],
      0.115,
      0.12,
    );
    for (const k of [-1, 1])
      oval(
        bird,
        "#fff1d9",
        s * 1.44 + k * 0.084,
        1.22,
        1.79,
        0.127,
        0.136,
        0.14,
        1,
      );
    const wing = oval(bird, "#a95229", s * 1.02, 0.59, -0.61, 0.22, 0.28, 0.66);
    wing.rotation.x = -0.36;
  }
  // Roasted skin flecks follow the curved breast.
  for (let i = 0; i < 75; i++) {
    let a = i * 2.39996,
      h = 0.16 + (0.83 * ((i * 47) % 79)) / 79,
      r = Math.sqrt(1 - h * h);
    oval(
      bird,
      i % 4 === 0 ? "#794427" : "#cf873d",
      -0.05 + 1.16 * r * Math.cos(a),
      0.83 + 0.91 * h,
      -0.07 + 1.55 * r * Math.sin(a),
      0.019 + (i % 4) * 0.008,
      0.012,
      0.023,
      0,
    );
  }
  sprig(bird, -0.2, 1.7, -0.28, -0.56, 0.73);
  if (n)
    for (let i = 0; i < Math.min(n, 4); i++) {
      let sl = oval(
        bird,
        "#f5c998",
        0.85 + i * 0.085,
        0.77,
        -0.17,
        0.11,
        0.56,
        0.73,
        2,
      );
      sl.rotation.z = -0.2;
    }
}
function knife(g: Group) {
  const k = new T.Group();
  k.position.set(2.0, 0.36, 0.12);
  k.rotation.y = 0.12;
  g.add(k);
  shape(
    k,
    "#b9c3ca",
    [
      [-0.15, -0.42],
      [0.22, -0.42],
      [0.23, 0.52],
      [0.15, 1.04],
      [-0.14, 1.36],
    ],
    0.05,
    0,
    0,
    0,
  );
  shape(
    k,
    "#e5e9e7",
    [
      [0.15, -0.42],
      [0.22, -0.42],
      [0.23, 0.52],
      [0.15, 1.04],
      [-0.14, 1.36],
      [0.1, 0.98],
    ],
    0.01,
    0,
    0.05,
    0,
  );
  box(k, "#59332a", 0.02, 0.075, 0.95, 0.27, 0.14, 1.12, 0.08);
  for (let i = 0; i < 2; i++)
    oval(k, "#d9b180", 0.02, 0.15, 0.75 + i * 0.38, 0.045, 0.012, 0.045);
}
function cloth(g: Group) {
  const c = new T.Group();
  c.position.set(-0.58, 0.025, 0.04);
  c.rotation.y = -0.25;
  g.add(c);
  box(c, "#f7d9c0", 0, 0, 0, 5.65, 0.07, 4.05, 0.03);
  for (let i = -7; i <= 7; i++)
    box(c, "#d58b81", i * 0.376, 0.038, 0, 0.17, 0.009, 4.02, 0.001);
  for (let j = -5; j <= 5; j++) {
    box(c, "#d99487", 0, 0.044, j * 0.376, 5.61, 0.009, 0.17, 0.001);
    for (let i = -7; i <= 7; i++)
      box(c, "#b56764", i * 0.376, 0.051, j * 0.376, 0.17, 0.01, 0.17, 0.001);
  }
}
export function board(p: Plate) {
  let g = new T.Group();
  cloth(g);
  box(g, "#9d6040", 0, 0.2, 0, 5.55, 0.27, 3.92, 0.15);
  box(g, "#d8a16c", 0, 0.32, 0, 5.48, 0.15, 3.85, 0.13);
  for (let i = 0; i < 6; i++) {
    let z = -1.57 + i * 0.6;
    box(
      g,
      i % 2 ? "#c69160" : "#d29b68",
      0,
      0.398,
      z,
      5.27,
      0.01,
      0.014,
      0.003,
    );
    for (let j = 0; j < 3; j++)
      box(
        g,
        "#c18c61",
        -1.85 + ((i * 3 + j * 7) % 9) * 0.44,
        0.4,
        z + 0.13 + j * 0.12,
        0.35 + ((i + j) % 4) * 0.12,
        0.008,
        0.011,
        0.003,
      );
  }
  roast(
    g,
    p.filter((f) => ["thin", "thick", "drumstick"].includes(f.kind)).length,
  );
  knife(g);
  sprig(g, -1.92, 0.41, 0.38, -0.62, 1.1);
  sprig(g, -1.66, 0.41, 0.75, -0.83, 1.15);
  sprig(g, 1.12, 0.41, -1.31, 1.52, 0.9);
  for (const [x, z] of [
    [-1.7, 1.14],
    [-1.5, 1.28],
    [-1.72, 1.38],
    [1.22, -1.1],
    [1.45, -1.23],
  ])
    berry(g, x, 0.51, z);
  for (const [x, z] of [
    [-1.7, -1.12],
    [-1.95, -1.22],
    [1.27, 1.43],
  ]) {
    const veg = oval(g, "#e99c39", x, 0.54, z, 0.19, 0.18, 0.23);
    veg.rotation.y = x;
  }
  return g;
}
export function food(g: Group, f: Food) {
  const p = new T.Group();
  p.position.set(f.x, 0.31, f.z);
  g.add(p);
  if (f.kind === "thin" || f.kind === "thick") {
    const h = f.kind === "thin" ? 0.12 : 0.24;
    oval(p, "#b66833", 0, h * 0.8, 0, 0.48, h, 0.66, 2);
    oval(p, "#f7c99d", 0, h * 1.12, 0, 0.444, h * 0.77, 0.6, 2);
    for (let i = -2; i < 3; i++)
      oval(
        p,
        "#e7b58b",
        i * 0.11,
        h * 1.86,
        0,
        0.012,
        0.006,
        0.3 - Math.abs(i) * 0.055,
      );
  } else if (f.kind === "drumstick") {
    oval(p, "#bc642e", 0, 0.27, 0, 0.36, 0.32, 0.52, 2);
    rod(p, "#f4dbb4", [0, 0.32, 0.3], [0, 0.45, 0.72], 0.1);
    oval(p, "#fff1d4", 0, 0.45, 0.75, 0.15, 0.11, 0.13);
  } else if (f.kind === "mash") {
    for (let i = 0; i < 6; i++)
      oval(
        p,
        "#f8dea0",
        Math.sin(i * 2.2) * 0.2,
        0.17 + (i === 5 ? 0.12 : 0),
        Math.cos(i * 2.2) * 0.19,
        0.29,
        0.2,
        0.27,
      );
    let butter = box(p, "#ffbd43", 0.02, 0.44, 0.02, 0.23, 0.08, 0.19);
    butter.rotation.y = 0.36;
  } else if (f.kind === "beans") {
    for (let i = 0; i < 9; i++) {
      let b = oval(
        p,
        i % 2 ? "#608147" : "#81934b",
        ((i % 4) - 1.5) * 0.11,
        0.1 + Math.floor(i / 4) * 0.065,
        (i % 3) * 0.046,
        0.055,
        0.064,
        0.42,
      );
      b.rotation.y = i * 0.13 - 0.35;
    }
  } else if (f.kind === "cranberry") {
    for (let i = 0; i < 16; i++)
      berry(
        p,
        Math.sin(i * 2.4) * 0.24 * (i / 16),
        0.1 + (1 - i / 16) * 0.2,
        Math.cos(i * 2.4) * 0.24 * (i / 16),
        0.125,
      );
  } else {
    oval(p, "#94502f", 0, 0.008, 0, 0.48 * f.size, 0.038, 0.43 * f.size, 2);
  }
  return p;
}
export function dish(p: Plate) {
  const g = new T.Group();
  cloth(g);
  const points = [
    [0, 0.18],
    [1.65, 0.18],
    [2.14, 0.3],
    [2.3, 0.36],
    [2.35, 0.33],
    [2.29, 0.22],
    [1.55, 0.08],
    [0.5, 0.07],
    [0, 0.07],
  ].map(([r, y]) => new T.Vector2(r, y));
  mesh(g, new T.LatheGeometry(points, 80), "#fff6da", 0, 0, 0);
  const rim = mesh(
    g,
    new T.TorusGeometry(2.22, 0.021, 6, 80),
    "#8d3649",
    0,
    0.327,
    0,
  );
  rim.rotation.x = Math.PI / 2;
  p.forEach((f) => food(g, f));
  return g;
}
export function disposeScene(o: Group) {
  o.traverse((obj) => {
    if (obj instanceof T.Mesh) {
      obj.geometry.dispose();
      if (obj.material.vertexColors) obj.material.dispose();
    }
  });
}
