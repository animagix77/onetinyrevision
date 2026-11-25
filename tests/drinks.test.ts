import assert from "node:assert/strict";
import test from "node:test";
import {
  type Serving,
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

test("only alcoholic pours trigger expense feedback, including repeat glasses and revisions", () => {
  const dry = review([], [], ["spritz", "cider", "spritz", "cider"]);
  assert.ok(margoLines.drinksOnly.includes(dry.note));
  const single = review([], [], ["bourbon", "cider", "spritz"]);
  assert.ok(margoLines.drinksOnly.includes(single.note));
  const two = review([], [], ["pinot", "pinot", "cider", "spritz"]);
  assert.ok(margoLines.barTab.includes(two.note));
  const prior: Serving = {
    plate: [],
    drinks: ["pinot", "pinot"],
    at: 1,
    verdict: two,
  };
  const three = review([], [prior], ["pinot", "pinot", "ale"]);
  assert.ok(margoLines.anotherRound.includes(three.note));
  const four = review([], [prior], ["ale", "ale", "bourbon", "pinot"]);
  assert.ok(margoLines.expenseReport.includes(four.note));
  assert.equal(four.score, 0);
});
