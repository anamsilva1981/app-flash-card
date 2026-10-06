import "./setup.mjs";
import { storage, fixture } from "./setup.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Injector, runInInjectionContext } from "@angular/core";
import * as app from "../../.test-build/index.mjs";
function services() {
  const injector = Injector.create({
    providers: [
      { provide: app.StudyStore, useFactory: () => new app.StudyStore() },
      { provide: app.I18nService, useFactory: () => new app.I18nService() },
    ],
  });
  return {
    injector,
    repository: runInInjectionContext(
      injector,
      () => new app.StudyRepository(),
    ),
    store: injector.get(app.StudyStore),
  };
}
beforeEach(() => {
  storage.clear();
  app.accountSession.set(null);
  app.setScope("guest");
});
test("stores mutations by ID and preserves cards after a rename", async () => {
  const { repository, store, injector } = services();
  const { subject, topic, card } = fixture();
  await repository.saveSubject(subject);
  await repository.saveTopic(topic);
  await repository.saveCard(card);
  await repository.saveSubject({ ...subject, name: "Renamed" }, subject);
  assert.equal(store.cards()[0].subject_id, subject.id);
  assert.equal(store.queue()[0].subject, "Renamed");
  await repository.completeTopic(store.queue()[0]);
  assert.equal(store.queue()[0].status, "done");
  await repository.rateCard(
    { ...store.cards()[0], interval: 9, due: "2026-12-01" },
    "Renamed",
    "good",
  );
  assert.equal(store.cards()[0].interval, 9);
  const review = runInInjectionContext(injector, () => new app.ReviewStore());
  review.subject.set("deck");
  review.practice.set(true);
  review.start();
  assert.equal(review.card().id, 1);
  assert.equal(review.nextInterval("again"), 1);
  const calendar = runInInjectionContext(
    injector,
    () => new app.CalendarStore(),
  );
  calendar.change(-1);
  assert.equal(calendar.selectedDay(), null);
  await assert.rejects(
    repository.saveSubject({ ...subject, id: "other", name: "Renamed" }),
    /Já existe/,
  );
  injector.destroy();
});
test("an import quota failure leaves signals and all persisted state unchanged", async () => {
  const { repository, store, injector } = services();
  const before = store.snapshot();
  storage.fail = true;
  try {
    await assert.rejects(repository.importBackup(fixture().backup));
    assert.deepEqual(store.snapshot(), before);
  } finally {
    storage.fail = false;
  }
  assert.deepEqual(app.cached("flashcards", []), []);
  injector.destroy();
});
test("imports one replayable batch and restores cache across store instances", async () => {
  app.accountSession.set({
    user: { id: "a", user_metadata: {} },
    access_token: "fake",
  });
  app.setScope("a");
  globalThis.fetch = async () => new Response(null, { status: 503 });
  const { repository, store, injector } = services();
  await repository.importBackup(fixture().backup);
  await app.flush();
  const queue = new app.AccountPersistence(storage).pending("a");
  assert.equal(queue.length, 1);
  assert.equal(queue[0].path, "rpc/apply_account_batch");
  assert.equal(store.cards()[0].subject_id, fixture().subject.id);
  assert.equal(new app.StudyStore().cards()[0].question, "Pergunta");
  injector.destroy();
});
