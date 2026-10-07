import { test } from "node:test";
import assert from "node:assert/strict";
import { CalendarStore } from "./calendar-store";

test("CalendarStore possui módulo carregável", () => {
  assert.equal(typeof CalendarStore, "function");
});
