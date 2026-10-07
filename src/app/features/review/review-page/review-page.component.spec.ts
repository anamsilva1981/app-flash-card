import { test } from "node:test";
import assert from "node:assert/strict";
import { ReviewPageComponent } from "./review-page.component";

test("ReviewPageComponent permanece disponível", () => {
  assert.equal(typeof ReviewPageComponent, "function");
});
