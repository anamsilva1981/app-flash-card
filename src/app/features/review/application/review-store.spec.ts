import { Injector, signal } from "@angular/core";
import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyStore } from "../../../core/state/study-store";
import { ReviewStore } from "./review-store";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

function createStore() {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
  const cards = signal([
    {
      id: 1,
      subject: "Angular",
      topic: "Signals",
      question: "Q1",
      answer: "A1",
      explanation: "",
      example: "",
      due: "2000-01-01",
      interval: 0,
    },
    {
      id: 2,
      subject: "Angular",
      topic: "RxJS",
      question: "Q2",
      answer: "A2",
      explanation: "",
      example: "",
      due: "2999-01-01",
      interval: 4,
    },
  ]);
  const activeSubjects = signal([
    { id: "angular", name: "Angular", days: [], archived: false },
  ]);
  const injector = Injector.create({
    providers: [
      { provide: StudyStore, useValue: { cards, activeSubjects } },
      ReviewStore,
    ],
  });
  return injector.get(ReviewStore);
}

test("ReviewStore filtra cartões e inicia revisão apenas com vencidos", () => {
  const store = createStore();
  store.subject.set("Angular");

  assert.deepEqual(store.topics(), ["Todos", "Signals", "RxJS"]);
  assert.equal(store.dueCards().length, 1);

  store.start();
  assert.deepEqual(store.sessionIds(), [1]);
  assert.equal(store.card()?.id, 1);
  assert.equal(store.progress(), "1 / 1");
});

test("ReviewStore modo prática inclui cartões não vencidos e reseta UI", () => {
  const store = createStore();
  store.subject.set("Angular");
  store.practice.set(true);
  store.flipped.set(true);
  store.explanationOpen.set(true);

  store.start();

  assert.equal(store.sessionIds().length, 2);
  assert.equal(store.flipped(), false);
  assert.equal(store.explanationOpen(), false);
  assert.equal(store.nextInterval("good") > 0, true);
});
