import { test } from "node:test";
import assert from "node:assert/strict";
import { ProgressFacade } from "./progress.facade";

test("ProgressFacade possui módulo carregável", () => {
  assert.equal(typeof ProgressFacade, "function");
});
