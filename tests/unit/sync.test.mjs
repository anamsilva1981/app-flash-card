import "./setup.mjs";
import { storage, fixture } from "./setup.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as app from "../../.test-build/index.mjs";
const login = (id) => {
  app.accountSession.set({
    user: { id, user_metadata: {} },
    access_token: "token:" + id,
  });
  app.setScope(id);
};
beforeEach(() => {
  storage.clear();
  login("a");
  globalThis.fetch = async () => new Response(null, { status: 503 });
});
test("retains offline writes and replays them in order", async () => {
  await app.commitBatch({ flashcards: [fixture().card] }, [
    { path: "account_cards", body: fixture().card },
  ]);
  await app.flush();
  assert.equal(app.hasPending(), true);
  await app.write("study_queue", { id: "topic" });
  await app.flush();
  assert.equal(app.hasPending(), true);
  const requests = [];
  globalThis.fetch = async (_, options) => {
    requests.push(JSON.parse(options.body));
    return new Response(null, { status: 204 });
  };
  await app.flush();
  assert.equal(app.hasPending(), false);
  assert.equal(requests[0].path, "account_cards");
  assert.equal(requests[1].path, "study_queue");
});
test("isolates accounts and does not share an old in-flight drain", async () => {
  const dispose = app.startSyncLifecycle();
  let started;
  const ready = new Promise((r) => (started = r));
  globalThis.fetch = async (_, options) => {
    if (options.headers.Authorization === "Bearer token:a") {
      started();
      return new Promise((_, reject) =>
        options.signal.addEventListener("abort", () =>
          reject(new Error("aborted")),
        ),
      );
    }
    return new Response(null, { status: 204 });
  };
  await app.write("account_cards", { id: 1 });
  await ready;
  login("b");
  await app.write("account_cards", { id: 2 });
  await app.flush();
  assert.equal(app.hasPending("b"), false);
  assert.equal(app.hasPending("a"), true);
  dispose();
});
test("shares one remote snapshot and rejects a stale response after switching accounts", async () => {
  let count = 0;
  const { state } = fixture();
  const remote = {
    subjects: state.subjects,
    queue: state.queue,
    cards: state.cards,
    activity: [],
    progress: [],
    preferences: {},
  };
  globalThis.fetch = async () => {
    count++;
    return Response.json([{ data: remote }]);
  };
  const responses = await Promise.all([
    app.api("account_cards"),
    app.api("study_subjects"),
  ]);
  assert.equal(count, 1);
  assert.equal((await responses[0].json())[0].question, "Pergunta");
  let finish;
  globalThis.fetch = () => new Promise((r) => (finish = r));
  login("different");
  const pending = app.readAccountSnapshot();
  await Promise.resolve();
  login("another");
  finish(Response.json([{ data: remote }]));
  await assert.rejects(pending, /Stale account snapshot/);
  assert.deepEqual(app.cached("flashcards", []), []);
});
test("serializes transactions and rejects a stale cache commit", async () => {
  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      app.commitTransaction((read) => ({
        patch: { counter: read("counter", 0) + 1 },
        operations: [{ path: "account_cards", body: { id: i } }],
      })),
    ),
  );
  await app.flush();
  assert.equal(app.cached("counter", 0), 10);
  assert.equal(new app.AccountPersistence(storage).pending("a").length, 10);
  const revision = app.writeRevision();
  app.cache("counter", 11);
  await assert.rejects(
    app.commitBatch({ counter: 100 }, [], "a", revision),
    /Stale/,
  );
  assert.equal(app.cached("counter", 0), 11);
});
test("guest mode never sends account operations", async () => {
  app.accountSession.set(null);
  app.setScope("guest");
  await app.commitBatch({ counter: 1 }, [{ path: "account_cards", body: {} }]);
  assert.equal(app.hasPending(), false);
  assert.equal(app.cached("counter", 0), 1);
  assert.deepEqual(await app.readAccountSnapshot(), app.EMPTY_SNAPSHOT);
});
