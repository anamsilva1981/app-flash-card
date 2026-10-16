import { test } from "node:test";
import assert from "node:assert/strict";
import * as rules from "./review-schedule";

test("review schedule expõe regras de domínio", () => {
  assert.ok(Object.keys(rules).length > 0);
});

test("separa os intervalos e recompensa acertos com XP", () => {
  assert.deepEqual(
    [
      rules.intervalFor(0, "again"),
      rules.intervalFor(0, "hard"),
      rules.intervalFor(0, "good"),
      rules.intervalFor(0, "easy"),
    ],
    [1, 2, 4, 7],
  );
  assert.equal(rules.intervalFor(4, "hard"), 6);
  assert.equal(rules.intervalFor(4, "good"), 10);
  assert.equal(rules.intervalFor(4, "easy"), 14);
  assert.deepEqual(
    [
      rules.xpForRating("again"),
      rules.xpForRating("hard"),
      rules.xpForRating("good"),
      rules.xpForRating("easy"),
    ],
    [0, 5, 10, 15],
  );
});
