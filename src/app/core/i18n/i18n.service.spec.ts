import { test } from "node:test";
import assert from "node:assert/strict";
import { I18nService } from "./i18n.service";

test("I18nService possui módulo carregável", () => {
  assert.equal(typeof I18nService, "function");
});
