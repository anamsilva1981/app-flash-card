import { test } from "node:test";
import assert from "node:assert/strict";
import { SessionComponent } from "./session.component";

test("SessionComponent permanece disponível", () => {
  assert.equal(typeof SessionComponent, "function");
});
