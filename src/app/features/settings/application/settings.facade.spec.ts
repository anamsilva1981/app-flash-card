import { test } from "node:test";
import assert from "node:assert/strict";
import { SettingsFacade } from "./settings.facade";

test("SettingsFacade possui módulo carregável", () => {
  assert.equal(typeof SettingsFacade, "function");
});
