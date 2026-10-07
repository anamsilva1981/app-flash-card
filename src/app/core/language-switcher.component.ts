import { Component, inject } from "@angular/core";
import { I18nService } from "./i18n.service";
@Component({
  selector: "app-language-switcher",
  standalone: true,
  template: `<button
    class="language-switcher"
    type="button"
    [attr.aria-label]="
      i18n.language() === 'en'
        ? 'Mudar idioma para português'
        : 'Switch language to English'
    "
    (click)="i18n.toggle()"
  >
    {{ i18n.language() === "en" ? "PT" : "EN" }}
  </button>`,
  styles: [
    `
      .language-switcher {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 300;
        min-width: 48px;
        height: 40px;
        padding: 0 12px;
        border: 1px solid #e9ecf3;
        border-radius: 999px;
        background: white;
        color: #4823bb;
        font-weight: 700;
        font-size: 12px;
        box-shadow: 0 6px 24px rgba(31, 40, 71, 0.08);
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);
}
