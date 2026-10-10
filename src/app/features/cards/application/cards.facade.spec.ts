import { test } from "node:test";
import assert from "node:assert/strict";
import { CardsFacade } from "./cards.facade";

test("CardsFacade possui módulo carregável", () => {
  assert.equal(typeof CardsFacade, "function");
});
