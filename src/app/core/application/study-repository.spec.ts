import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyRepository } from "./study-repository";

test("StudyRepository possui módulo carregável", () => {
  assert.equal(typeof StudyRepository, "function");
});
