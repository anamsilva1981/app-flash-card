import { test } from "node:test";
import assert from "node:assert/strict";
import { SettingsPageComponent } from "./settings-page.component";

test("SettingsPageComponent possui módulo carregável", () => {
  assert.equal(typeof SettingsPageComponent, "function");
});
