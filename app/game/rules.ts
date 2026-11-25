import { margoLines } from "./margo-lines";
import { z } from "zod";
export const kinds = [
  "thin",
  "thick",
  "drumstick",
  "mash",
  "beans",
  "cranberry",
  "gravy",
] as const;
export type Kind = (typeof kinds)[number];
export const names: Record<Kind, string> = {
  thin: "Thin slice",
  thick: "Thick slice",
  drumstick: "Drumstick",
  mash: "Mashed potatoes",
  beans: "Green beans",
  cranberry: "Cranberries",
  gravy: "Gravy",
};
export const plateSchema = z
  .array(
    z
      .object({
        kind: z.enum(kinds),
        x: z.number().finite(),
        z: z.number().finite(),
        size: z.number().min(0.4).max(1.4),
      })
      .refine((p) => Math.hypot(p.x, p.z) <= 2.3),
  )
  .max(20);
export type Plate = z.infer<typeof plateSchema>;
export type Food = Plate[number];
export const side = (k: Kind) =>
  k === "mash" || k === "beans" || k === "cranberry";
export const meat = (k: Kind) =>
  k === "thin" || k === "thick" || k === "drumstick";
export const brief = [
  "Two thin slices of turkey",
  "One scoop each of two different sides",
  "Gravy clear of the turkey",
];
export const drinkKinds = [
  "pinot",
  "ale",
  "bourbon",
  "cider",
  "spritz",
] as const;
export const drinkSchema = z.enum(drinkKinds);
export type Drink = (typeof drinkKinds)[number];
export const drinkNames: Record<Drink, string> = {
  pinot: "Pinot Noir",
  ale: "Amber ale",
  bourbon: "Bourbon cider",
  cider: "Hot apple cider",
  spritz: "Cranberry spritz (zero proof)",
};
export function portionList(p: Plate) {
  const counts = new Map<Kind, number>();
  for (const f of p) counts.set(f.kind, (counts.get(f.kind) ?? 0) + 1);
  return [...counts].map(([k, n]) => n + " × " + names[k]).join(" · ");
}
export function assess(p: Plate) {
  const turkey = p.filter((f) => meat(f.kind)),
    sides = p.filter((f) => side(f.kind)),
    sauce = p.filter((f) => f.kind === "gravy");
  const wet = sauce.find((g) =>
    turkey.some((t) => Math.hypot(t.x - g.x, t.z - g.z) < 0.48 + 0.43 * g.size),
  );
  const checks = [
    turkey.length === 2 && turkey.every((f) => f.kind === "thin"),
    sides.length === 2 && new Set(sides.map((f) => f.kind)).size === 2,
    sauce.length > 0 && !wet,
  ];
  let pool: keyof typeof margoLines = "approved";
  let target: Food | undefined;
  if (!checks[0]) {
    target = turkey.find((f) => f.kind !== "thin") ?? turkey[2] ?? turkey[0];
    pool = !target
      ? "missingTurkey"
      : target.kind === "drumstick"
        ? "drumstick"
        : target.kind === "thick"
          ? "thick"
          : turkey.length < 2
            ? "oneSlice"
            : "extraSlices";
  } else if (!checks[1]) {
    target = sides[2] ?? sides[1] ?? sides[0];
    pool = !target
      ? "missingSides"
      : sides.length === 1
        ? "oneSide"
        : sides.length > 2
          ? "extraSides"
          : target.kind === "mash"
            ? "doubleMash"
            : target.kind === "beans"
              ? "doubleBeans"
              : "doubleBerries";
  } else if (!checks[2]) {
    target = wet;
    pool = !wet ? "noGravy" : sauce.length > 1 ? "flood" : "wet";
  } else if (sauce.length > 1) pool = "ampleSauce";
  return { checks, pool, pin: target ? { x: target.x, z: target.z } : null };
}
export function review(p: Plate, previousNote?: string) {
  const { pool, checks, pin } = assess(p);
  const lines = margoLines[
    previousNote && pool === "approved" ? "comeback" : pool
  ].filter((line) => line !== previousNote);
  return {
    checks,
    score: checks.filter(Boolean).length,
    pin,
    note: lines[Math.floor(Math.random() * lines.length)],
  };
}
export type Verdict = ReturnType<typeof review>;
export type Serving = {
  drink?: Drink | null;
  plate: Plate;
  verdict: Verdict;
  at: number;
};
export type Entry = {
  drink?: Drink | null;
  id: string;
  chef: string;
  draft: Plate;
  servings: Serving[];
  version: number;
  updated: number;
  mine: boolean;
};
export type Note = {
  id: string;
  plate: string;
  chef: string;
  message: string;
  created: number;
};
