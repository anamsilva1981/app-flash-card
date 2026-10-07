import { test } from "node:test";
import assert from "node:assert/strict";
import { HomePageComponent } from "./home-page.component";

test("HomePageComponent permanece disponível", () => {
  assert.equal(typeof HomePageComponent, "function");
});
