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
      .refine((p) => Math.hypot(p.x, p.z) <= 1.89),
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
  "Two different sides",
  "Gravy clear of the turkey",
];
export function review(p: Plate) {
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
  const i = checks.indexOf(false);
  const target = [turkey[0], sides[0], wet || sauce[0]][i];
  const note =
    i === 0
      ? "I asked for two thin slices. Please revisit the cut before we bring in another stakeholder."
      : i === 1
        ? "Two sides, two distinct points of view. A second scoop of the same thing is a duplicate deliverable."
        : i === 2
          ? wet
            ? "The gravy is touching my turkey. We discussed boundaries."
            : "I see the vision. I do not see the gravy."
          : "Two thin slices, two distinct sides, and the skin stayed crisp. Approved. Please don’t change anything.";
  return {
    checks,
    score: checks.filter(Boolean).length,
    note,
    pin: target ? { x: target.x, z: target.z } : null,
  };
}
export type Verdict = ReturnType<typeof review>;
export type Serving = { plate: Plate; verdict: Verdict; at: number };
export type Entry = {
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
