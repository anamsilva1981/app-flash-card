import { test } from "node:test";
import assert from "node:assert/strict";
import { AppIconComponent } from "./app-icon.component";

test("AppIconComponent permanece reutilizável", () => {
  assert.equal(typeof AppIconComponent, "function");
});
