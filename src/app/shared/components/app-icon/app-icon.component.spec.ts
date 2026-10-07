import { test } from "node:test";
import assert from "node:assert/strict";
import { AppIconComponent, SubjectBadgeComponent } from "./app-icon.component";

test("componentes de ícone compartilhados permanecem disponíveis", () => {
  assert.equal(typeof AppIconComponent, "function");
  assert.equal(typeof SubjectBadgeComponent, "function");
});
