import { test } from "node:test";
import assert from "node:assert/strict";
import { ProgressPageComponent } from "./progress-page.component";

test("ProgressPageComponent permanece disponível", () => {
  assert.equal(typeof ProgressPageComponent, "function");
});
