import { test } from "node:test";
import assert from "node:assert/strict";
import * as rules from "./progress";

test("progress expõe regras de domínio", () => {
  assert.ok(Object.keys(rules).length > 0);
});
