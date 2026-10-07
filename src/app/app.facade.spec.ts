import { test } from "node:test";
import assert from "node:assert/strict";
import { AppFacade } from "./app.facade";

test("AppFacade possui módulo carregável", () => {
  assert.equal(typeof AppFacade, "function");
});
