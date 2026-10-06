import "./setup.mjs";
import { fixture, MemoryStorage } from "./setup.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as app from "../../.test-build/index.mjs";
import { readPublicConfig } from "../../scripts/configure.mjs";
test("review scheduling, priorities and immutable mutations", () => {
  for (const [r, d] of [
    ["again", 1],
    ["hard", 2],
    ["good", 4],
    ["easy", 7],
  ])
    assert.equal(app.intervalFor(0, r), d);
  assert.equal(app.intervalFor(4, "good"), 9);
  assert.equal(app.intervalFor(365, "easy"), 365);
  const { card, topic } = fixture();
  assert.equal(app.createCard({ ...card, id: 0 }).id > 0, true);
  assert.throws(() => app.createCard({ ...card, question: "" }));
  assert.deepEqual(
    app.upsertCard([card], { ...card, answer: "Edited" })[0].answer,
    "Edited",
  );
  assert.equal(
    app.sortStudyItems([
      { ...topic, id: "a", priority: "baixa" },
      { ...topic, id: "b", priority: "alta" },
    ])[0].id,
    "b",
  );
  assert.equal(
    app.completeStudyItem([topic], topic.id, "2026-10-06")[0].status,
    "done",
  );
  assert.equal(topic.status, "todo");
  assert.equal(app.normalizeStudyLink("example.com"), "https://example.com/");
  assert.throws(() => app.normalizeStudyLink("javascript:alert(1)"));
  assert.equal(app.normalizeStudyLink(""), null);
  assert.equal(
    app.dueReviewCards([card], "deck", "Todos", "2026-10-06").length,
    1,
  );
  assert.equal(
    app.dueReviewCards([card], null, "Todos", "2026-10-06").length,
    0,
  );
  assert.deepEqual(app.buildReviewSession([card], 0), [1]);
  assert.equal(app.totalDueCards([card], [fixture().subject], "2026-10-06"), 1);
});
test("normalizes IDs and preserves renamed and archived subject relations", () => {
  const { state, subject } = fixture();
  const normalized = app.normalizeRelations(state);
  assert.equal(normalized.cards[0].subject_id, subject.id);
  assert.equal(normalized.cards[0].topic_id, state.queue[0].id);
  assert.equal(
    app.belongsToSubject(normalized.cards[0], {
      ...subject,
      name: "Renomeada",
    }),
    true,
  );
  const renamed = app.renameSubjectRelations(
    normalized.cards,
    normalized.queue,
    { ...subject, name: "Renomeada" },
    subject.name,
  );
  assert.equal(renamed.queue[0].subject, "Renomeada");
  assert.equal(renamed.cards[0].subject_id, subject.id);
  assert.equal(app.activeSubjects([{ ...subject, archived: true }]).length, 0);
  assert.equal(app.subjectsForToday([subject], "2026-10-05").length, 1);
});
test("validates and prepares complete backups without changing existing data", () => {
  const { state, backup, card } = fixture();
  const parsed = app.parseBackup(JSON.stringify(backup));
  const prepared = app.prepareBackup(state, parsed);
  assert.equal(prepared.state.cards[0].interval, 1);
  assert.equal(state.cards[0].interval, 0);
  assert.equal(
    app.mergeBackupCards([card], [{ ...card, answer: "Unexpected" }]).cards[0]
      .answer,
    card.answer,
  );
  assert.throws(
    () =>
      app.parseBackup(
        JSON.stringify({ ...backup, version: 1, cards: undefined }),
      ),
    /backup antigo/,
  );
  assert.throws(() =>
    app.parseBackup(
      JSON.stringify({ ...backup, cards: [{ ...card, due: "2026-02-30" }] }),
    ),
  );
  assert.throws(() =>
    app.prepareBackup(state, {
      ...backup,
      topics: [{ ...fixture().topic, id: "new", link: "javascript:alert(1)" }],
    }),
  );
  assert.equal(
    app.createBackup(state.cards, state.subjects, state.queue, state.history)
      .version,
    2,
  );
  const incoming = {
    ...backup,
    subjects: [{ ...fixture().subject, id: "other" }],
    cards: [{ ...card, id: 2, subject_id: "other" }],
  };
  assert.equal(
    app.prepareBackup(state, incoming).state.cards[1].subject_id,
    fixture().subject.id,
  );
});
test("commits cache and queue atomically and preserves both on quota failure", () => {
  const memory = new MemoryStorage();
  const storage = new app.AccountPersistence(memory);
  storage.commit(
    "a",
    { flashcards: [fixture().card] },
    [{ path: "account_cards", body: { id: 1 } }],
    true,
  );
  assert.equal(storage.pending("a").length, 1);
  memory.fail = true;
  assert.throws(() =>
    storage.commit(
      "a",
      { flashcards: [] },
      [{ path: "study_queue", body: { id: 2 } }],
      true,
    ),
  );
  assert.equal(storage.cached("a", "flashcards", []).length, 1);
  assert.equal(storage.pending("a").length, 1);
  assert.equal(storage.cached("b", "flashcards", []).length, 0);
  memory.fail = false;
  storage.remove("a", storage.pending("a")[0].id);
  assert.equal(storage.pending("a").length, 0);
  storage.commit(
    "guest",
    { flashcards: [] },
    [{ path: "account_cards", body: {} }],
    false,
  );
  assert.equal(storage.pending("guest").length, 0);
});
test("timezone boundaries, calendars, history and notifications", () => {
  const now = new Date("2026-10-06T01:00:00Z");
  assert.equal(app.studyDate(now, "America/Sao_Paulo"), "2026-10-05");
  assert.equal(app.studyDate(now, "Asia/Tokyo"), "2026-10-06");
  assert.ok(
    app
      .calendarReminder("20:00", [1, 3, 5], now, "Asia/Tokyo")
      .includes("DTSTART;TZID=Asia/Tokyo:20261006T200000"),
  );
  assert.throws(() => app.calendarReminder("25:00", [1]));
  assert.throws(() => app.calendarReminder("20:00", []));
  const history = app.addStudyActivity([], "2026-10-05", "Tema", "learning");
  assert.equal(app.studyStreak(history, "2026-10-06"), 1);
  assert.equal(
    app.countStudyDaysInMonth(new Date("2026-10-01T12:00:00"), history),
    1,
  );
  assert.equal(
    app
      .buildCalendarDays(new Date("2026-10-01T12:00:00"), history, "2026-10-05")
      .filter((x) => x.learning).length,
    1,
  );
  const policy = {
    enabled: true,
    permissionGranted: true,
    localTime: "20:00",
    currentDay: 1,
    allowedDays: [1],
    configuredTime: "20:00",
    shownToday: false,
  };
  assert.equal(app.shouldShowReminder(policy), true);
  assert.equal(app.shouldShowReminder({ ...policy, shownToday: true }), false);
  assert.equal(app.onboardingStepFor(false, [], [], []), "deck");
  assert.equal(app.onboardingStepFor(true, [], [], []), "done");
});
test("public configuration rejects privileged keys and invalid URLs", () => {
  const env = {
    SUPABASE_URL: "https://backend.invalid",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
    APP_OWNER_NAME: "Fixture",
    APP_SUPPORT_URL: "https://support.invalid",
    APP_PRIVACY_UPDATED_AT: "2026-01-01",
  };
  assert.equal(readPublicConfig(env).ownerName, "Fixture");
  for (const patch of [
    { SUPABASE_URL: "" },
    { SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture" },
    { APP_SUPPORT_URL: "javascript:alert(1)" },
    { APP_PRIVACY_UPDATED_AT: "2026-02-30" },
  ])
    assert.throws(() => readPublicConfig({ ...env, ...patch }));
});
test("explicit translations interpolate user content without translating it", () => {
  assert.equal(
    app.translate("home.greeting", "en", { name: "Salvar" }),
    "Hello, Salvar!",
  );
  assert.equal(
    app.translate("home.greeting", "pt-BR", { name: "Ana" }),
    "Olá, Ana!",
  );
  assert.equal(app.translate("missing", "en"), "missing");
});
