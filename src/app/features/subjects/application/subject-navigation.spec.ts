import { test } from "node:test";
import assert from "node:assert/strict";
import { SubjectNavigation } from "./subject-navigation";

test("SubjectNavigation possui módulo carregável", () => {
  assert.equal(typeof SubjectNavigation, "function");
});
