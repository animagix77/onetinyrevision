import { firstWetPour } from "./models";
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
        inBoat: z.literal(true).optional(),
        size: z.number().min(0.4).max(1.4),
      })
      .refine(
        (p) => Math.hypot(p.x, p.z) <= 2.3 && (!p.inBoat || p.kind === "gravy"),
      ),
  )
  .max(20);
export type Plate = z.infer<typeof plateSchema>;
export type Food = Plate[number];
export const staysPut = (kind: Kind) =>
  kind === "gravy" || kind === "cranberry";
export const placementRule = "Gravy and cranberries stay where you place them.";
export function keepsCommittedPortions(before: Plate, after: Plate) {
  const remaining = after.filter((f) => staysPut(f.kind));
  return before
    .filter((f) => staysPut(f.kind))
    .every((f) => {
      const index = remaining.findIndex(
        (n) =>
          n.kind === f.kind &&
          n.x === f.x &&
          n.z === f.z &&
          n.size === f.size &&
          n.inBoat === f.inBoat,
      );
      if (index < 0) return false;
      remaining.splice(index, 1);
      return true;
    });
}
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
  const counts = new Map<string, number>();
  for (const f of p) {
    const label = f.inBoat ? "Gravy on the side" : names[f.kind];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, n]) => n + " × " + label).join(" · ");
}
export function assess(p: Plate) {
  const turkey = p.filter((f) => meat(f.kind)),
    sides = p.filter((f) => side(f.kind)),
    sauce = p.filter((f) => f.kind === "gravy");
  const wet = firstWetPour(p, turkey);
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
    pool = !wet
      ? "noGravy"
      : sauce.filter((f) => !f.inBoat).length > 1
        ? "flood"
        : "wet";
  } else if (sauce.length > 1) pool = "ampleSauce";
  return { checks, pool, pin: target ? { x: target.x, z: target.z } : null };
}
export function review(p: Plate, history: Serving[] = []): Verdict {
  const { pool, checks, pin } = assess(p);
  const score = checks.filter(Boolean).length;
  const approved = history.length >= 3 && score === 3;
  const previous = history.at(-1);
  let voice: keyof typeof margoLines = pool;
  if (score === 3 && !approved) {
    const turkey = p.filter((f) => meat(f.kind));
    const moved =
      previous?.verdict.score === 3 &&
      turkey.some(
        (slice, i) =>
          slice.z >
          (previous.plate.filter((f) => meat(f.kind))[i]?.z ?? slice.z) + 0.15,
      );
    voice = moved ? "movedTurkey" : "holding";
  } else if (
    previous &&
    checks[0] &&
    !checks[1] &&
    !previous.verdict.checks[0]
  ) {
    voice = "turkeyFixed";
  } else if (
    previous &&
    checks[0] &&
    checks[1] &&
    !checks[2] &&
    !previous.verdict.checks[1]
  ) {
    voice = "sidesFixed";
  }
  const lines = margoLines[voice];
  const used = new Set(history.map((s) => s.verdict.note));
  const fresh = lines.filter((line) => !used.has(line));
  const choices = fresh.length
    ? fresh
    : lines.filter((line) => line !== previous?.verdict.note);
  return {
    checks,
    score,
    pin,
    approved,
    note: choices[Math.floor(Math.random() * choices.length)],
  };
}
export type Verdict = {
  checks: boolean[];
  score: number;
  pin: { x: number; z: number } | null;
  note: string;
  approved?: boolean;
};
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
