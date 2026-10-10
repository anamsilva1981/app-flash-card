import { test } from "node:test";
import assert from "node:assert/strict";
import { ReviewFacade } from "./review.facade";

test("ReviewFacade possui módulo carregável", () => {
  assert.equal(typeof ReviewFacade, "function");
});
