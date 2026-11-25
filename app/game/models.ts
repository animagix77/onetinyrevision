import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Food, Plate, Drink } from "./rules";
import { PlateSurface, gravyPour } from "./plate-surface";
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
function food(g: Group, f: Food) {
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
  }
  return p;
}
function glassware(g: Group, drink: Drink) {
  const glass = new T.Group();
  g.add(glass);
  glass.position.set(-2.65, 0.14, -0.26);
  const wine = drink === "pinot",
    mug = drink === "cider" || drink === "ale",
    height = wine ? 0.98 : drink === "bourbon" ? 0.52 : 0.78;
  const base = wine ? 0.41 : 0.04,
    radius = wine ? 0.31 : 0.27;
  if (wine) {
    mesh(
      glass,
      new T.CylinderGeometry(0.23, 0.255, 0.045, 28),
      "#d6cec3",
      0,
      0.024,
      0,
    );
    mesh(
      glass,
      new T.CylinderGeometry(0.04, 0.034, 0.37, 16),
      "#e5ddd1",
      0,
      0.22,
      0,
    );
  }
  const shell = (profile: number[][], color: string) =>
    mesh(
      glass,
      new T.LatheGeometry(
        profile.map(([r, h]) => new T.Vector2(r, h)),
        32,
      ),
      color,
      0,
      0,
      0,
    );
  const color = {
    pinot: "#782a45",
    ale: "#b86a1c",
    bourbon: "#ae5627",
    cider: "#c78435",
    spritz: "#d05066",
  }[drink];
  shell(
    [
      [0, base],
      [radius * 0.7, base],
      [radius, base + 0.12],
      [radius * 0.96, height - 0.12],
    ],
    mug && drink === "cider" ? "#9f5750" : color,
  );
  shell(
    [
      [radius * 0.96, height - 0.12],
      [radius * 0.94, height],
      [radius * 0.86, height],
      [radius * 0.86, height - 0.12],
    ],
    drink === "cider" ? "#e1ae8b" : "#dbd8c8",
  );
  mesh(
    glass,
    new T.CylinderGeometry(radius * 0.9, radius * 0.9, 0.025, 32),
    drink === "ale" ? "#f6e1a7" : color,
    0,
    height - 0.072,
    0,
  );
  if (mug) {
    const handle = mesh(
      glass,
      new T.TorusGeometry(0.15, 0.045, 7, 20),
      drink === "cider" ? "#ac6459" : "#e1d3b1",
      radius + 0.065,
      height * 0.55,
      0,
    );
    handle.scale.y = 1.28;
  }
  if (drink === "spritz") {
    berry(glass, 0.12, height - 0.04, 0.05, 0.065);
    berry(glass, 0.01, height - 0.045, 0.1, 0.052);
  }
  if (drink === "bourbon")
    box(glass, "#ded1ab", 0.06, height - 0.055, 0.03, 0.14, 0.1, 0.14, 0.025);
}
export function dish(p: Plate, drink?: Drink | null, withCloth = true) {
  const g = new T.Group();
  if (withCloth) cloth(g);
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
  ]
    .reverse()
    .map(([r, y]) => new T.Vector2(r, y));
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
  for (const [index, item] of p.entries()) {
    if (item.kind === "gravy" || item.kind === "cranberry") continue;
    const model = food(g, item);
    model.userData.portionIndex = index;
  }
  if (drink) glassware(g, drink);
  const boatIndex = p.findIndex((f) => f.inBoat);
  if (boatIndex >= 0) {
    const boat = new T.Group();
    g.add(boat);
    boat.position.set(2.48, 0.14, -1.58);
    boat.userData.portionIndex = boatIndex;
    const wall = [
      [0, 0],
      [0.22, 0],
      [0.37, 0.14],
      [0.45, 0.37],
      [0.44, 0.44],
      [0.4, 0.45],
      [0.39, 0.38],
      [0.33, 0.18],
      [0, 0.12],
    ].map(([r, y]) => new T.Vector2(r, y));
    const hull = mesh(boat, new T.LatheGeometry(wall, 36), "#fff3d5", 0, 0, 0);
    hull.scale.x = 1.42;
    const handle = mesh(
      boat,
      new T.TorusGeometry(0.15, 0.045, 8, 20),
      "#ffe8bd",
      0.61,
      0.27,
      0,
    );
    handle.scale.x = 1.1;
    const level =
      0.27 + Math.min(0.11, p.filter((f) => f.inBoat).length * 0.025);
    oval(boat, "#925132", 0, level, 0, 0.54, 0.021, 0.35, 2);
  }
  settleToppings(g, p);
  return g;
}

// Score on the same plate surface and with the same pour geometry that players see.
export function firstWetPour(plate: Plate, turkey: Food[]) {
  const pours = plate.filter((f) => f.kind === "gravy" && !f.inBoat);
  if (!turkey.length || !pours.length) return undefined;
  const surface = new PlateSurface();
  const solids = new T.Group();
  for (const item of plate) {
    if (item.kind === "gravy" || item.kind === "cranberry") continue;
    const portion = food(solids, item);
    surface.add(portion, turkey.includes(item) ? "turkey" : "food");
  }
  disposeScene(solids);
  for (const pour of pours) {
    const pool = gravyPour(pour, surface);
    const wet = surface.add(pool, "gravy");
    pool.geometry.dispose();
    if (wet) return pour;
  }
}
export function settleToppings(g: T.Group, p: Plate) {
  if (
    !p.some((f) => f.kind === "cranberry" || (f.kind === "gravy" && !f.inBoat))
  )
    return;
  const surface = new PlateSurface();
  for (const child of [...g.children]) {
    const index = child.userData.portionIndex;
    if (child.userData.topping) {
      g.remove(child);
      disposeScene(child);
    } else if (index !== undefined && !p[index].inBoat) {
      surface.add(child);
    }
  }
  for (const [index, portion] of p.entries()) {
    if (portion.kind !== "gravy" || portion.inBoat) continue;
    const pool = gravyPour(portion, surface);
    pool.userData = { portionIndex: index, topping: true, gravy: true };
    g.add(pool);
    surface.add(pool);
  }
  for (const [index, portion] of p.entries()) {
    if (portion.kind !== "cranberry") continue;
    const pile = new T.Group();
    pile.position.set(portion.x, 0, portion.z);
    pile.userData = { portionIndex: index, topping: true };
    g.add(pile);
    for (let i = 0; i < 16; i++) {
      const r = i / 16;
      const x = Math.sin(i * 2.4) * 0.24 * r,
        z = Math.cos(i * 2.4) * 0.24 * r;
      const h = surface.at(portion.x + x, portion.z + z);
      berry(pile, x, h + 0.113 + (1 - r) * 0.16, z, 0.125);
    }
    surface.add(pile);
  }
}
export function disposeScene(o: Group) {
  o.traverse((obj) => {
    if (obj instanceof T.Mesh) {
      obj.geometry.dispose();
      if (obj.material.vertexColors) obj.material.dispose();
    }
  });
}

function diningChair(parent: Group, x: number, z: number, angle: number) {
  const chair = new T.Group();
  chair.position.set(x, 0, z);
  chair.rotation.y = angle;
  parent.add(chair);
  const wood = "#593041",
    fabric = "#7e364c";
  box(chair, wood, 0, 0.95, 0, 1.1, 0.16, 1, 0.09);
  box(chair, fabric, 0, 1.06, 0, 1.04, 0.16, 0.94, 0.09);
  for (const sx of [-0.42, 0.42])
    for (const sz of [-0.37, 0.37])
      rod(
        chair,
        wood,
        [sx * 1.14, 0.01, sz * 1.16],
        [sx, 0.95, sz],
        0.055,
        0.075,
      );
  for (const sx of [-0.43, 0.43])
    rod(chair, wood, [sx, 0.98, -0.43], [sx, 2.1, -0.55], 0.065);
  box(chair, fabric, 0, 1.78, -0.51, 1.09, 0.96, 0.17, 0.08);
  return chair;
}
function margoAtHead(parent: Group) {
  const m = new T.Group();
  parent.add(m);
  m.position.set(0, 1.02, -2.7);
  m.rotation.y = 0.09;
  // The ochre blazer, silver bob, and angular glasses echo Margo’s guest-check portrait.
  oval(m, "#c68c2f", 0, 0.69, 0, 0.57, 0.69, 0.37, 2);
  for (const x of [-0.25, 0.25]) {
    const lapel = box(m, "#e0ad56", x, 0.93, 0.29, 0.18, 0.55, 0.065, 0.025);
    lapel.rotation.z = x > 0 ? -0.31 : 0.31;
    const arm = oval(
      m,
      "#c48a34",
      Math.sign(x) * 0.48,
      0.59,
      0.18,
      0.185,
      0.5,
      0.19,
      1,
    );
    arm.rotation.x = -0.47;
    oval(m, "#c8845d", Math.sign(x) * 0.49, 0.37, 0.39, 0.14, 0.135, 0.17);
  }
  oval(m, "#542b3a", 0, 0.89, 0.31, 0.22, 0.37, 0.09);
  rod(m, "#bc7955", [0, 1.07, 0], [0, 1.45, 0], 0.16);
  oval(m, "#cdc0b1", 0, 1.78, -0.05, 0.55, 0.64, 0.45, 2);
  oval(m, "#d99a73", 0, 1.67, 0.095, 0.44, 0.48, 0.39, 2);
  for (const x of [-0.425, 0.425]) {
    oval(m, "#d4966f", x, 1.64, 0.11, 0.09, 0.14, 0.07);
    oval(m, "#e6bd54", x, 1.51, 0.15, 0.063, 0.065, 0.045);
  }
  const sweep = oval(m, "#ded4c7", -0.11, 2.0, 0.19, 0.48, 0.22, 0.31, 2);
  sweep.rotation.z = 0.28;
  oval(m, "#b6a8a1", 0.37, 1.92, 0.11, 0.16, 0.31, 0.25);
  for (const sign of [-1, 1]) {
    const x = sign * 0.21,
      y = 1.76;
    const pts = [
      [x - 0.176, y + 0.1, 0.424],
      [x + 0.176, y + 0.115, 0.424],
      [x + 0.131, y - 0.097, 0.454],
      [x - 0.13, y - 0.096, 0.454],
    ];
    pts.forEach((v, i) => rod(m, "#462837", v, pts[(i + 1) % 4], 0.029));
    oval(m, "#422839", x, y, 0.465, 0.032, 0.036, 0.024, 1);
    rod(
      m,
      "#624536",
      [x - 0.095, y + 0.148, 0.39],
      [x + 0.096, y + 0.15 + sign * 0.034, 0.37],
      0.027,
    );
  }
  rod(m, "#462837", [-0.058, 1.79, 0.435], [0.058, 1.79, 0.435], 0.021);
  oval(m, "#b97756", 0, 1.64, 0.459, 0.084, 0.093, 0.085);
  rod(m, "#793f44", [-0.115, 1.49, 0.424], [0.071, 1.5, 0.438], 0.018);
  rod(m, "#793f44", [0.071, 1.5, 0.438], [0.12, 1.526, 0.42], 0.016);
}
function centerpiece(parent: Group, x: number) {
  for (const z of [-0.38, 0.38]) {
    const h = z < 0 ? 0.63 : 0.89;
    mesh(
      parent,
      new T.CylinderGeometry(0.13, 0.19, 0.075, 12),
      "#b38a4c",
      x,
      1.8,
      z,
    );
    rod(parent, "#c9a058", [x, 1.81, z], [x, 1.95, z], 0.075);
    rod(parent, "#ffe5ae", [x, 1.94, z], [x, 1.94 + h, z], 0.073);
    oval(parent, "#ffc35c", x, 2.03 + h, z, 0.046, 0.1, 0.048, 1);
  }
  for (let n = 0; n < 2; n++) {
    const px = x + 0.32 + n * 0.34,
      pz = n ? 0.15 : -0.02,
      r = n ? 0.15 : 0.22;
    for (let i = 0; i < 8; i++)
      oval(
        parent,
        n ? "#b65c2e" : "#cf7030",
        px + Math.cos((i * Math.PI) / 4) * r * 0.5,
        1.78 + r * 0.67,
        pz + Math.sin((i * Math.PI) / 4) * r * 0.5,
        r * 0.68,
        r * 0.8,
        r * 0.68,
      );
    rod(
      parent,
      "#66542c",
      [px, 1.78 + r * 1.3, pz],
      [px + 0.035, 1.78 + r * 1.95, pz],
      0.034,
    );
  }
  sprig(parent, x - 0.2, 1.79, 0.09, -1.25, 0.65);
}
export function banquetModel(
  settings: { plate: Plate; drink?: Drink | null }[],
) {
  const room = new T.Group();
  const top = 1.75;
  box(room, "#ba805f", 0, -0.15, 0, 16, 0.19, 11, 0.18);
  box(room, "#aa5b54", 0, -0.037, 0, 12.8, 0.036, 8.45, 0.16);
  box(room, "#c77d64", 0, -0.013, 0, 12.5, 0.024, 8.16, 0.13);
  for (const x of [-4.3, 4.3])
    for (const z of [-1.5, 1.5])
      box(room, "#805039", x, 0.83, z, 0.25, 1.67, 0.27, 0.035);
  box(room, "#8a533a", 0, 1.49, 0, 9.45, 0.32, 3.68, 0.09);
  box(room, "#ad6c49", 0, 1.64, 0, 10.0, 0.21, 4.24, 0.15);
  box(room, "#efe0be", 0, 1.745, 0, 9.99, 0.055, 4.2, 0.1);
  box(room, "#904756", 0, 1.782, 0, 10, 0.035, 0.86, 0.018);
  for (const z of [-0.35, 0.35])
    box(room, "#eabd81", 0, 1.805, z, 9.94, 0.012, 0.014, 0.004);
  for (const x of [-4.99, 4.99])
    box(room, "#904756", x, 1.41, 0, 0.05, 0.72, 0.86, 0.012);
  diningChair(room, 0, -2.83, 0);
  margoAtHead(room);
  // The judge's clipboard and tasting fork are the only place setting.
  const station = new T.Group();
  station.position.set(0, top + 0.05, -1.64);
  room.add(station);
  box(station, "#694333", 0.15, 0.05, 0, 0.91, 0.07, 0.69);
  box(station, "#fff4d8", 0.15, 0.097, 0, 0.84, 0.024, 0.61, 0.012);
  for (let i = 0; i < 3; i++)
    box(
      station,
      "#b1a28b",
      0.12,
      0.113,
      -0.15 + i * 0.11,
      0.47 - i * 0.08,
      0.006,
      0.016,
      0.002,
    );
  rod(station, "#a1373a", [-0.08, 0.14, 0.24], [0.46, 0.14, 0.01], 0.026);
  box(station, "#71806a", -0.69, 0.045, 0, 0.34, 0.035, 0.68);
  box(station, "#dcd3c4", -0.69, 0.078, -0.04, 0.055, 0.029, 0.42);
  box(station, "#dcd3c4", -0.69, 0.078, 0.14, 0.136, 0.029, 0.073);
  for (const off of [-0.053, 0, 0.053])
    box(
      station,
      "#e7ddc8",
      -0.69 + off,
      0.078,
      0.22,
      0.023,
      0.028,
      0.16,
      0.007,
    );
  centerpiece(room, -4.56);
  const anchors: T.Vector3[] = [];
  for (const [i, setting] of settings.entries()) {
    const columns = Math.ceil(settings.length / 2);
    const x = (Math.floor(i / 2) - (columns - 1) / 2) * 2.25;
    const z = i % 2 === 0 ? 1.05 : -0.62;
    const plate = dish(setting.plate, setting.drink, false);
    plate.scale.setScalar(0.32);
    plate.position.set(x, top + 0.075, z);
    plate.userData.seat = i;
    room.add(plate);
    const card = box(
      room,
      "#ffefc9",
      x,
      top + 0.17,
      z + 0.75,
      0.72,
      0.27,
      0.055,
      0.012,
    );
    card.rotation.x = -0.2;
    card.userData.seat = i;
    anchors.push(new T.Vector3(x, top + 0.35, z + 0.74));
  }
  return { room, anchors };
}
