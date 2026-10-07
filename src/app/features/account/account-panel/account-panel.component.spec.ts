import { test } from "node:test";
import assert from "node:assert/strict";
import { AccountPanelComponent } from "./account-panel.component";

test("AccountPanelComponent permanece disponível", () => {
  assert.equal(typeof AccountPanelComponent, "function");
});
