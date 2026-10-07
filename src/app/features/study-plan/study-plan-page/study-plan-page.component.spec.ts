import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyPlanPageComponent } from "./study-plan-page.component";

test("StudyPlanPageComponent permanece disponível", () => {
  assert.equal(typeof StudyPlanPageComponent, "function");
});
