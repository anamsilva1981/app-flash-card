import "@angular/compiler";
export class MemoryStorage {
  values = new Map();
  fail = false;
  getItem(k) {
    return this.values.get(k) || null;
  }
  setItem(k, v) {
    if (this.fail) throw new DOMException("Quota", "QuotaExceededError");
    this.values.set(k, v);
  }
  removeItem(k) {
    this.values.delete(k);
  }
  clear() {
    this.values.clear();
  }
}
export const storage = new MemoryStorage();
globalThis.localStorage = storage;
const events = new EventTarget();
globalThis.window = {
  addEventListener: (...a) => events.addEventListener(...a),
  removeEventListener: (...a) => events.removeEventListener(...a),
  dispatchEvent: (e) => events.dispatchEvent(e),
  setInterval: () => 1,
  clearInterval() {},
};
export function fixture() {
  const subject = {
    id: "50eb4d6b-532e-449b-99b3-55e56d7de663",
    name: "Matéria",
    deck_key: "deck",
    days: [1],
    archived: false,
  };
  const topic = {
    id: "5c70eb80-f352-4a9f-8b8a-f0ff938e184a",
    title: "Tema",
    subject: "Matéria",
    notes: "",
    link: null,
    priority: "media",
    status: "todo",
    completed_at: null,
  };
  const card = {
    id: 1,
    subject: "deck",
    topic: "Tema",
    question: "Pergunta",
    answer: "Resposta",
    explanation: "Explicação",
    example: "Exemplo",
    due: "2026-10-06",
    interval: 0,
  };
  return {
    subject,
    topic,
    card,
    state: { subjects: [subject], queue: [topic], cards: [card], history: [] },
    backup: {
      version: 2,
      subjects: [subject],
      topics: [topic],
      cards: [card],
      progress: [{ id: 1, due: "2026-10-07", interval: 1 }],
      history: [],
    },
  };
}

const locks = new Map();
Object.defineProperty(navigator, "locks", {
  configurable: true,
  value: {
    request(key, action) {
      const previous = locks.get(key) || Promise.resolve();
      const pending = previous.catch(() => {}).then(action);
      locks.set(key, pending);
      return pending.finally(() => {
        if (locks.get(key) === pending) locks.delete(key);
      });
    },
  },
});
