import { test } from "node:test";
import assert from "node:assert/strict";
import { ReviewPageComponent } from "./review-page.component";

test("ReviewPageComponent possui módulo carregável", () => {
  assert.equal(typeof ReviewPageComponent, "function");
});
