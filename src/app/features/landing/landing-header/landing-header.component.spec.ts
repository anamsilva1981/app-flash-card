import { test } from "node:test";
import assert from "node:assert/strict";
import { LandingHeaderComponent } from "./landing-header.component";

test("LandingHeaderComponent pode ser carregado", () => {
  assert.equal(typeof LandingHeaderComponent, "function");
});
