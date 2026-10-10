import { test } from "node:test";
import assert from "node:assert/strict";
import { ProgressPageComponent } from "./progress-page.component";

test("ProgressPageComponent possui módulo carregável", () => {
  assert.equal(typeof ProgressPageComponent, "function");
});
