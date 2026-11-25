import test from "node:test";
import assert from "node:assert/strict";
import { review, type Plate, type Serving } from "../app/game/rules";
import { margoLines } from "../app/game/margo-lines";

const turkey: Plate = [
  { kind: "thin", x: -1, z: 0, size: 1 },
  { kind: "thin", x: 1, z: 0, size: 1 },
];
const meal: Plate = [
  ...turkey,
  { kind: "beans", x: 0, z: 1, size: 1 },
  { kind: "mash", x: 0, z: -1, size: 1 },
  { kind: "gravy", x: 0, z: 0, size: 1, inBoat: true },
];
const serving = (plate: Plate, history: Serving[] = []): Serving => ({
  plate,
  at: history.length,
  verdict: review(plate, history),
});

test("each round saves one food-specific quote and remembers corrections", () => {
  const first = serving(turkey.slice(0, 1));
  assert.ok(margoLines.oneSlice.includes(first.verdict.note));
  const second = serving(turkey, [first]);
  assert.ok(margoLines.turkeyFixed.includes(second.verdict.note));
  const third = serving(meal.slice(0, -1), [first, second]);
  assert.ok(margoLines.sidesFixed.includes(third.verdict.note));
  const fourth = serving(meal, [first, second, third]);
  assert.equal(fourth.verdict.approved, true);
  assert.ok(margoLines.approved.includes(fourth.verdict.note));
  for (const { verdict } of [first, second, third, fourth])
    assert.ok(!("clientNote" in verdict));
});

test("perfect early plates get distinct Thanksgiving feedback before sign-off", () => {
  const first = serving(meal);
  const second = serving(meal, [first]);
  const moved = meal.map((f) => (f.kind === "thin" ? { ...f, z: 1 } : f));
  const third = serving(moved, [first, second]);
  assert.ok(margoLines.holding.includes(first.verdict.note));
  assert.notEqual(second.verdict.note, first.verdict.note);
  assert.ok(margoLines.movedTurkey.includes(third.verdict.note));
  assert.equal(third.verdict.approved, false);
  assert.equal(review(meal, [first, second, third]).approved, true);
});
