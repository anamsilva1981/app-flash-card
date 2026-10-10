import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyPlanFacade } from "./study-plan.facade";

test("StudyPlanFacade possui módulo carregável", () => {
  assert.equal(typeof StudyPlanFacade, "function");
});
