import { test } from "node:test";
import assert from "node:assert/strict";
import { HistoryPageComponent } from "./history-page.component";

test("HistoryPageComponent permanece disponível", () => {
  assert.equal(typeof HistoryPageComponent, "function");
});
