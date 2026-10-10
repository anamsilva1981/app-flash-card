import { test } from "node:test";
import assert from "node:assert/strict";
import { TopicEditorPageComponent } from "./topic-editor-page.component";

test("TopicEditorPageComponent possui módulo carregável", () => {
  assert.equal(typeof TopicEditorPageComponent, "function");
});
