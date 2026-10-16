import { test } from "node:test";
import assert from "node:assert/strict";
import { levelForXp, xpForRating } from "./gamification";

test("gamification calcula XP e níveis", () => {
  assert.deepEqual(
    [
      xpForRating("again"),
      xpForRating("hard"),
      xpForRating("good"),
      xpForRating("easy"),
    ],
    [0, 5, 10, 15],
  );
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(99), 1);
  assert.equal(levelForXp(100), 2);
});
