import { test } from "node:test";
import assert from "node:assert/strict";
import { LanguageSwitcherComponent } from "./language-switcher.component";

test("LanguageSwitcherComponent pode ser carregado isoladamente", () => {
  assert.equal(typeof LanguageSwitcherComponent, "function");
});
