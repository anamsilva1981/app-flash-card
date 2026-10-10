import { test } from "node:test";
import assert from "node:assert/strict";
import { AccountFacade } from "./account.facade";

test("AccountFacade possui módulo carregável", () => {
  assert.equal(typeof AccountFacade, "function");
});
