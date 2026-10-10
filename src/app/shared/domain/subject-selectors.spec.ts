import { test } from "node:test";
import assert from "node:assert/strict";
import * as rules from "./subject-selectors";

test("subject selectors expõe regras de domínio", () => {
  assert.ok(Object.keys(rules).length > 0);
});
