import test from "node:test";
import assert from "node:assert/strict";
import { clientFeedback } from "../app/game/client-notes";
import { review, type Plate, type Serving } from "../app/game/rules";

test("Margo remembers her request, withholds sign-off, and saves the earlier notes", () => {
  const plate: Plate = [{ kind: "thin", x: 0, z: 0, size: 1 }];
  const served: Serving[] = [];
  function taste(p: Plate, score: number) {
    const feedback = clientFeedback(p, null, served, score);
    served.push({
      plate: p,
      verdict: { ...review(p), ...feedback },
      at: served.length,
    });
    return feedback;
  }
  assert.match(taste(plate, 1).clientNote, /logo bigger/);
  assert.match(
    clientFeedback(plate, null, served, 1).clientNote,
    /look for the turkey/,
  );
  assert.match(taste([{ ...plate[0], z: 1 }], 1).clientNote, /ad for turkey/);
  assert.equal(taste(plate, 3).approved, false);
  assert.equal(clientFeedback(plate, null, served, 2).approved, false);
  assert.equal(taste(plate, 3).approved, true);
  assert.match(served[0].verdict.clientNote!, /logo bigger/);
});
