import assert from "node:assert/strict";
import test from "node:test";
import {
  assess,
  review,
  type Food,
  type Kind,
  type Plate,
} from "../app/game/rules";

const portion = (kind: Kind, x: number, z: number): Food => ({
  kind,
  x,
  z,
  size: 1,
});
const plate: Plate = [
  portion("thin", 0, 0),
  portion("thin", -1.4, -0.3),
  portion("mash", 1.3, -0.4),
  portion("beans", 1.1, -1),
];

test("gravy touching the long tip of a slice costs the gravy point in either placement order", () => {
  const gravy = portion("gravy", 0, 0.94);
  for (const meal of [
    [...plate, gravy],
    [gravy, ...plate],
  ]) {
    assert.deepEqual(assess(meal).checks, [true, true, false]);
    assert.equal(review(meal).score, 2);
  }
});

test("gravy just clear of the narrower edge earns full marks", () => {
  assert.equal(review([...plate, portion("gravy", 0.905, 0)]).score, 3);
});

test("gravy served in the boat earns full marks and leaves turkey dry", () => {
  const boat = { ...portion("gravy", 0, 0), inBoat: true as const };
  assert.equal(review([...plate, boat]).score, 3);
  assert.equal(review([...plate, boat, portion("gravy", 0, 0)]).score, 2);
});
