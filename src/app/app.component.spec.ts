import { test } from "node:test";
import assert from "node:assert/strict";
import { AppComponent } from "./app.component";

test("AppComponent permanece disponível como app shell", () => {
  assert.equal(typeof AppComponent, "function");
});
