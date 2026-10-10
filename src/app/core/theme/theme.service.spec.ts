import { test } from "node:test";
import assert from "node:assert/strict";
import { ThemeService } from "./theme.service";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function installBrowser(saved: string | null, systemDark = false) {
  const storage = new MemoryStorage();
  if (saved) storage.setItem("study-theme", saved);
  const listeners: Array<(event: { matches: boolean }) => void> = [];
  const root = {
    dataset: {} as Record<string, string>,
    style: { colorScheme: "" },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: { documentElement: root, querySelector: () => null },
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: {
      matchMedia: () => ({
        matches: systemDark,
        addEventListener: (
          _: string,
          listener: (event: { matches: boolean }) => void,
        ) => listeners.push(listener),
      }),
    },
    configurable: true,
  });
  return { storage, root, listeners };
}

test("ThemeService usa sistema na primeira visita e acompanha suas mudanças", () => {
  const { root, listeners } = installBrowser(null, true);
  const service = new ThemeService();
  service.start();
  assert.equal(service.preference(), "system");
  assert.equal(root.dataset["theme"], "dark");
  listeners[0]({ matches: false });
  assert.equal(root.dataset["theme"], "light");
});

test("ThemeService restaura e persiste uma escolha explícita", () => {
  const { storage, root, listeners } = installBrowser("dark");
  const service = new ThemeService();
  service.start();
  assert.equal(root.dataset["theme"], "dark");
  service.setPreference("light");
  listeners[0]({ matches: true });
  assert.equal(storage.getItem("study-theme"), "light");
  assert.equal(root.dataset["theme"], "light");
});
