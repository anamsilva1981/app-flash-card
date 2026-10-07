import { test } from "node:test";
import assert from "node:assert/strict";
import { AppNavigation } from "./app-navigation";

test("AppNavigation possui módulo carregável", () => {
  assert.equal(typeof AppNavigation, "function");
});
