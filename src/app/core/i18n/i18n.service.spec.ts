import { test } from "node:test";
import assert from "node:assert/strict";
import { I18nService, translate } from "./i18n.service";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function installBrowser(locale?: "pt-BR" | "en") {
  const storage = new MemoryStorage();
  if (locale) storage.setItem("study-locale", locale);
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
  const documentStub = { documentElement: { lang: "" } };
  Object.defineProperty(globalThis, "document", {
    value: documentStub,
    configurable: true,
  });
  return { storage, documentStub };
}

test("translate interpola parâmetros e preserva chave desconhecida", () => {
  assert.equal(
    translate("home.greeting", "pt-BR", { name: "Ana" }),
    "Olá, Ana!",
  );
  assert.equal(
    translate("home.greeting", "en", { name: "Ana" }),
    "Hello, Ana!",
  );
  assert.equal(translate("chave.inexistente", "en"), "chave.inexistente");
});

test("I18nService lê, alterna e persiste o idioma", () => {
  const { storage, documentStub } = installBrowser("en");
  const service = new I18nService();

  assert.equal(service.language(), "en");
  service.toggle();

  assert.equal(service.language(), "pt-BR");
  assert.equal(storage.getItem("study-locale"), "pt-BR");
  assert.equal(documentStub.documentElement.lang, "pt-BR");
});
