import { test } from "node:test";
import assert from "node:assert/strict";
import { ReminderService } from "./reminder-service";

test("ReminderService possui módulo carregável", () => {
  assert.equal(typeof ReminderService, "function");
});
