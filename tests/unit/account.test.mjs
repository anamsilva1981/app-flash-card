import "./setup.mjs";
import { storage, fixture } from "./setup.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as app from "../../.test-build/index.mjs";
const login = (id) => {
  app.accountSession.set({
    user: { id, email: id + "@example.test" },
    access_token: "token:" + id,
  });
  app.setScope(id);
};
beforeEach(() => {
  storage.clear();
  login("a");
});
test("support binds the request to the initiating account and rejects a late completion", async () => {
  const service = new app.AccountService();
  let finish, headers, body;
  globalThis.fetch = async (_, options) => {
    headers = options.headers;
    body = JSON.parse(options.body);
    return new Promise((resolve) => (finish = resolve));
  };
  const pending = service.support("Disposable support message");
  login("b");
  finish(new Response(null, { status: 201 }));
  await assert.rejects(pending, /Account changed/);
  assert.equal(headers.Authorization, "Bearer token:a");
  assert.equal(body.user_id, "a");
});
test("deletion clears only the deleted account and leaves a newly selected session active", async () => {
  app.cache("flashcards", [{ ...fixture().card, id: 1 }]);
  login("b");
  app.cache("flashcards", [{ ...fixture().card, id: 2 }]);
  login("a");
  const service = new app.AccountService();
  let signedOut = false,
    started,
    finish;
  service.auth = {
    signInWithPassword: async () => ({
      data: { session: { access_token: "reauth:a" } },
      error: null,
    }),
    signOut: async () => {
      signedOut = true;
      return { error: null };
    },
  };
  const ready = new Promise((resolve) => (started = resolve));
  let token;
  globalThis.fetch = async (_, options) => {
    token = options.headers.Authorization;
    started();
    return new Promise((resolve) => (finish = resolve));
  };
  const pending = service.deleteAccount("Fixture@123");
  await ready;
  login("b");
  finish(Response.json({ deleted: true }));
  await pending;
  assert.equal(token, "Bearer reauth:a");
  assert.equal(signedOut, false);
  assert.equal(app.accountSession().user.id, "b");
  assert.deepEqual(app.cached("flashcards", []), [
    { ...fixture().card, id: 2 },
  ]);
  assert.deepEqual(app.cached("flashcards", [], "a"), []);
});
test("logout keeps unsent changes durable when the backend rejects a write", async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await app.write("account_cards", { id: 1 });
  await app.flush();
  const service = new app.AccountService();
  let signedOut = false;
  service.auth = {
    signOut: async () => {
      signedOut = true;
      return { error: null };
    },
  };
  await assert.rejects(service.logout(), /Pending sync/);
  assert.equal(signedOut, false);
  assert.equal(app.hasPending(), true);
});
