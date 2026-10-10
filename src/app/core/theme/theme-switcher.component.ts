import { Component, inject } from "@angular/core";
import { I18nService } from "../i18n/i18n.service";
import { ThemePreference, ThemeService } from "./theme.service";

@Component({
  selector: "app-theme-switcher",
  standalone: true,
  template: `
    <section class="theme-setting" aria-labelledby="theme-setting-title">
      <div class="theme-copy">
        <b id="theme-setting-title">{{ label("Tema", "Theme") }}</b>
        <span>{{
          label(
            "Escolha a aparência do aplicativo",
            "Choose the application appearance"
          )
        }}</span>
      </div>
      <div
        class="theme-options"
        role="radiogroup"
        [attr.aria-label]="label('Tema do aplicativo', 'Application theme')"
      >
        @for (option of options; track option.value) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="theme.preference() === option.value"
            [class.active]="theme.preference() === option.value"
            (click)="theme.setPreference(option.value)"
          >
            {{ label(option.pt, option.en) }}
          </button>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 20px;
      }
      .theme-setting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 72px;
        padding: 14px 18px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .theme-copy {
        min-width: 0;
      }
      .theme-copy b,
      .theme-copy span {
        display: block;
      }
      .theme-copy b {
        font-size: 13px;
        line-height: 1.5;
      }
      .theme-copy span {
        margin-top: 4px;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.5;
      }
      .theme-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        padding: 4px;
        border-radius: 14px;
        background: var(--surface-subtle);
        border: 1px solid var(--border);
        flex-shrink: 0;
      }
      .theme-options button {
        min-height: 40px;
        min-width: 72px;
        padding: 8px 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }
      .theme-options button:hover {
        color: var(--primary);
        background: var(--primary-soft);
      }
      .theme-options button.active {
        color: var(--primary);
        background: var(--surface);
        box-shadow: 0 2px 8px var(--shadow-color);
      }
      @media (max-width: 560px) {
        .theme-setting {
          align-items: stretch;
          flex-direction: column;
        }
        .theme-options button {
          min-width: 0;
          padding-inline: 8px;
        }
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly options: ReadonlyArray<{
    value: ThemePreference;
    pt: string;
    en: string;
  }> = [
    { value: "light", pt: "Claro", en: "Light" },
    { value: "dark", pt: "Escuro", en: "Dark" },
    { value: "system", pt: "Sistema", en: "System" },
  ];

  label(pt: string, en: string) {
    return this.i18n.language() === "en" ? en : pt;
  }
}
