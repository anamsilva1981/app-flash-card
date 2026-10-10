import { test } from "node:test";
import assert from "node:assert/strict";
import { HistoryFacade } from "./history.facade";

test("HistoryFacade possui módulo carregável", () => {
  assert.equal(typeof HistoryFacade, "function");
});
