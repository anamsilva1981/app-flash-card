import { test } from "node:test";
import assert from "node:assert/strict";
import { AccountService } from "./account-service";

test("AccountService possui módulo carregável", () => {
  assert.equal(typeof AccountService, "function");
});
