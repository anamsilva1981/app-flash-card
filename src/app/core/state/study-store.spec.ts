import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyStore } from "./study-store";

test("StudyStore possui módulo carregável", () => {
  assert.equal(typeof StudyStore, "function");
});
