import { test } from "node:test";
import assert from "node:assert/strict";
import { HomeFacade } from "./home.facade";

test("HomeFacade possui módulo carregável", () => {
  assert.equal(typeof HomeFacade, "function");
});
