import { test } from "node:test";
import assert from "node:assert/strict";
import { SubjectsFacade } from "./subjects.facade";

test("SubjectsFacade possui módulo carregável", () => {
  assert.equal(typeof SubjectsFacade, "function");
});
