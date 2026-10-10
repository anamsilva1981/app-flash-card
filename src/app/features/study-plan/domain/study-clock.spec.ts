import { test } from "node:test";
import assert from "node:assert/strict";
import * as rules from "./study-clock";

test("study clock expõe regras de domínio", () => {
  assert.ok(Object.keys(rules).length > 0);
});
