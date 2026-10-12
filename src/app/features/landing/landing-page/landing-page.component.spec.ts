import { test } from "node:test";
import assert from "node:assert/strict";
import { LandingPageComponent } from "./landing-page.component";
test("LandingPageComponent expõe a landing pública", () =>
  assert.equal(typeof LandingPageComponent, "function"));
