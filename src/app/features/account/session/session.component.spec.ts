import { test } from "node:test";
import assert from "node:assert/strict";
import { SessionComponent } from "./session.component";

test("SessionComponent possui módulo carregável", () => {
  assert.equal(typeof SessionComponent, "function");
});
