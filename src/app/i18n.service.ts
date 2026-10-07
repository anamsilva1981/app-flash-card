import { Injectable, signal } from "@angular/core";
import { MESSAGES } from "./messages";
import { browserPlatform } from "./platform/browser-platform";
export type Locale = "pt-BR" | "en";
export type TranslationParams = Record<string, string | number>;
export function translate(
  key: string,
  locale: Locale,
  params: TranslationParams = {},
): string {
  const message = MESSAGES[key];
  if (!message) return key;
  return (locale === "en" ? message.en : message.pt).replace(
    /\{(\w+)\}/g,
    (_, name: string) => String(params[name] ?? `{${name}}`),
  );
}
@Injectable({ providedIn: "root" })
export class I18nService {
  readonly language = signal<Locale>(this.initial());
  private initial(): Locale {
    try {
      return browserPlatform.storage.getItem("study-locale") === "en"
        ? "en"
        : "pt-BR";
    } catch {
      return "pt-BR";
    }
  }
  start() {
    browserPlatform.setLanguage(this.language());
  }
  setLanguage(locale: Locale) {
    this.language.set(locale);
    try {
      browserPlatform.storage.setItem("study-locale", locale);
    } catch {
      /* Language remains usable if storage is unavailable. */
    }
    this.start();
  }
  toggle() {
    this.setLanguage(this.language() === "en" ? "pt-BR" : "en");
  }
  t(key: string, params: TranslationParams = {}) {
    return translate(key, this.language(), params);
  }
}
