import assert from "node:assert/strict";
import test from "node:test";
import {
  drinkList,
  drinksFor,
  drinksSchema,
  maxDrinks,
  review,
} from "../app/game/rules";
import { margoLines } from "../app/game/margo-lines";

test("old single pairings and new mixed orders keep exact quantities", () => {
  assert.deepEqual(drinksFor({ drink: "pinot" }), ["pinot"]);
  assert.deepEqual(drinksFor({ drink: "pinot", drinks: [] }), []);
  assert.equal(
    drinkList(["cider", "ale", "ale"]),
    "2 × Amber ale · 1 × Hot apple cider",
  );
  assert.ok(drinksSchema.safeParse(Array(maxDrinks).fill("cider")).success);
  assert.equal(
    drinksSchema.safeParse(Array(maxDrinks + 1).fill("cider")).success,
    false,
  );
});

test("Margo can review a drinks-only order against the same dinner brief", () => {
  const verdict = review([], [], ["ale", "cider", "cider"]);
  assert.equal(verdict.score, 0);
  assert.ok(margoLines.drinksOnly.includes(verdict.note));
});
