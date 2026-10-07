import { test } from "node:test";
import assert from "node:assert/strict";
import { CardEditorPageComponent } from "./card-editor-page.component";

test("CardEditorPageComponent permanece disponível", () => {
  assert.equal(typeof CardEditorPageComponent, "function");
});
