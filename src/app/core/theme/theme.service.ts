import { Injectable, signal } from "@angular/core";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "study-theme";

@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readPreference());
  readonly resolvedTheme = signal<ResolvedTheme>("light");

  private mediaQuery: MediaQueryList | null = null;
  private readonly onSystemChange = (event: MediaQueryListEvent) => {
    if (this.preference() === "system") {
      this.apply(event.matches ? "dark" : "light");
    }
  };

  start() {
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQuery.addEventListener("change", this.onSystemChange);
    this.applyPreference();
  }

  setPreference(preference: ThemePreference) {
    this.preference.set(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* Theme remains usable if storage is unavailable. */
    }
    this.applyPreference();
  }

  private readPreference(): ThemePreference {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : "system";
    } catch {
      return "system";
    }
  }

  private applyPreference() {
    const preference = this.preference();
    const resolved =
      preference === "system"
        ? this.mediaQuery?.matches
          ? "dark"
          : "light"
        : preference;
    this.apply(resolved);
  }

  private apply(theme: ResolvedTheme) {
    this.resolvedTheme.set(theme);
    document.documentElement.dataset["theme"] = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0F172A" : "#F8FAFC");
  }
}
