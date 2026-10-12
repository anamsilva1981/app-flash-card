import { test } from "node:test";
import assert from "node:assert/strict";
import { LandingFooterComponent } from "./landing-footer.component";
test("LandingFooterComponent pode ser carregado", () =>
  assert.equal(typeof LandingFooterComponent, "function"));
