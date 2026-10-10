import { Component, inject } from "@angular/core";
import { I18nService } from "./i18n.service";
@Component({
  selector: "app-language-switcher",
  standalone: true,
  template: `
    <section class="language-setting">
      <div>
        <b>{{ i18n.language() === "en" ? "Language" : "Idioma" }}</b>
        <span>
          {{
            i18n.language() === "en"
              ? "Choose the application language"
              : "Escolha o idioma do aplicativo"
          }}
        </span>
      </div>
      <button
        class="language-switcher"
        type="button"
        [attr.aria-label]="
          i18n.language() === 'en'
            ? 'Mudar idioma para português'
            : 'Switch language to English'
        "
        (click)="i18n.toggle()"
      >
        {{ i18n.language() === "en" ? "Português" : "English" }}
      </button>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 20px;
      }
      .language-setting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 72px;
        padding: 14px 18px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: white;
        box-shadow: var(--shadow);
      }
      .language-setting > div {
        min-width: 0;
      }
      .language-setting b,
      .language-setting span {
        display: block;
      }
      .language-setting b {
        font-size: 13px;
        line-height: 1.5;
      }
      .language-setting span {
        margin-top: 4px;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.5;
      }
      .language-switcher {
        min-width: 92px;
        min-height: 42px;
        padding: 0 14px;
        border: 0;
        border-radius: 12px;
        background: var(--primary-soft);
        color: #4823bb;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
      }
      @media (max-width: 380px) {
        .language-setting {
          align-items: flex-start;
          flex-direction: column;
        }
        .language-switcher {
          width: 100%;
        }
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);
}
