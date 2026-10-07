import { test } from "node:test";
import assert from "node:assert/strict";
import { ReviewStore } from "./review-store";

test("ReviewStore possui módulo carregável", () => {
  assert.equal(typeof ReviewStore, "function");
});
