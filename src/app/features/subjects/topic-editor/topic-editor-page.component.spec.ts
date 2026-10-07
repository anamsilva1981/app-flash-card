import { test } from "node:test";
import assert from "node:assert/strict";
import { TopicEditorPageComponent } from "./topic-editor-page.component";

test("TopicEditorPageComponent permanece disponível", () => {
  assert.equal(typeof TopicEditorPageComponent, "function");
});
