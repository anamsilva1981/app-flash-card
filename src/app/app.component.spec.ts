import { test } from "node:test";
import assert from "node:assert/strict";
import { AppComponent } from "./app.component";

test("AppComponent pode ser carregado como composição raiz", () => {
  assert.equal(typeof AppComponent, "function");
});
