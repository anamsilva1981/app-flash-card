import { test } from "node:test";
import assert from "node:assert/strict";
import { StudyStore } from "./study-store";

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

function installStorage() {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}

test("StudyStore aplica snapshot sem misturar referências anteriores", () => {
  installStorage();
  const store = new StudyStore();
  const state = {
    cards: [
      {
        id: 1,
        subject: "Angular",
        topic: "Signals",
        question: "O que é signal?",
        answer: "Estado reativo",
        explanation: "",
        due: "2026-10-07",
        interval: 0,
      },
    ],
    subjects: [{ id: "angular", name: "Angular", days: [3], archived: false }],
    queue: [],
    history: [],
  };

  store.apply(state);

  assert.deepEqual(store.snapshot(), state);
  assert.equal(store.activeSubjects().length, 1);

  store.subjects.set([{ ...state.subjects[0], archived: true }]);
  assert.equal(store.activeSubjects().length, 0);
});

test("StudyStore restaura cache persistido do escopo atual", () => {
  installStorage();
  localStorage.setItem(
    "study:guest:state-v2",
    JSON.stringify({
      version: 2,
      values: {
        "display-name": "Ana",
        "study-subject-config": [
          { id: "aws", name: "AWS", days: [3], archived: false },
        ],
        flashcards: [],
        "study-queue": [],
        "study-history": [],
      },
      pending: [],
      revision: 1,
    }),
  );

  const store = new StudyStore();
  store.displayName.set("");
  store.subjects.set([]);
  store.restoreCache();

  assert.equal(store.displayName(), "Ana");
  assert.equal(store.subjects()[0]?.name, "AWS");
});
