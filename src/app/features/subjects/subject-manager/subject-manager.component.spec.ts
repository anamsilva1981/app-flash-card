import { test } from "node:test";
import assert from "node:assert/strict";
import { SubjectManagerComponent } from "./subject-manager.component";

test("SubjectManagerComponent possui módulo carregável", () => {
  assert.equal(typeof SubjectManagerComponent, "function");
});
