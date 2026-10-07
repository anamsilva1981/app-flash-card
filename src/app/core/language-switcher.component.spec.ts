import { test } from "node:test";
import assert from "node:assert/strict";
import { LanguageSwitcherComponent } from "./language-switcher.component";

test("LanguageSwitcherComponent permanece disponível", () => {
  assert.equal(typeof LanguageSwitcherComponent, "function");
});
