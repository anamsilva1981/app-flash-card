import { test } from "node:test";
import assert from "node:assert/strict";
import { ThemeSwitcherComponent } from "./theme-switcher.component";

test("ThemeSwitcherComponent pode ser carregado isoladamente", () => {
  assert.equal(typeof ThemeSwitcherComponent, "function");
});
