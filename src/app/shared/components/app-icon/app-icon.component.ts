import { Component, Input } from "@angular/core";
const paths: Record<string, string[]> = {
  home: ["m3 10 9-7 9 7v10h-6v-7H9v7H3Z"],
  book: [
    "M12 6v15",
    "M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2",
  ],
  calendar: [
    "M7 3v4M17 3v4M3 11h18",
    "M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z",
    "M8 15h1M15 15h1M8 18h1",
  ],
  user: ["M8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0", "M4 21v-2a8 8 0 0 1 16 0v2"],
  cards: [
    "M8 3h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
    "M3 7v13a2 2 0 0 0 2 2M10 8h7M10 12h7M10 16h4",
  ],
  chevron: ["m9 6 6 6-6 6"],
  back: ["m15 6-6 6 6 6"],
  plus: ["M12 5v14M5 12h14"],
  close: ["m6 6 12 12M6 18 18 6"],
  check: ["m5 12 4 4L19 6"],
  edit: ["m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15Z"],
  archive: ["M3 3h18v4H3Z", "M5 7v13h14V7M9 11h6"],
  cloud: ["M6 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0-1 10Z"],
  code: ["m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"],
  layers: ["m12 3 10 5-10 5L2 8Z", "m2 12 10 5 10-5M2 16l10 5 10-5"],
  building: ["M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M8 9h1m6 0h1M8 12h1m6 0h1"],
  coffee: [
    "M4 7h12v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z",
    "M16 8h2a3 3 0 0 1 0 6h-2M7 3v1m4-1v1m4-1v1M2 22h18",
  ],
  bulb: ["M9 18h6M9 21h6M8 15a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z"],
  repeat: [
    "m17 2 4 4-4 4M21 6H7a4 4 0 0 0-4 4",
    "m7 22-4-4 4-4M3 18h14a4 4 0 0 0 4-4",
  ],
  download: ["M12 3v12m-5-5 5 5 5-5", "M4 15v5h16v-5"],
  save: ["M4 3h13l4 4v14H3V3Z", "M7 3v6h9V3M7 21v-7h10v7"],
  settings: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "m10 2-.5 3-2 .8-2.5-1.5L2 8l2 2v4l-2 2 3 3.7 2.5-1.5 2 .8.5 3h4l.5-3 2-.8 2.5 1.5 3-3.7-2-2v-4l2-2-3-3.7L17 5.8l-2-.8-.5-3Z",
  ],
  chart: ["M4 3v18h17M8 16v-4m5 4V8m5 8V5"],
  flame: ["M12 3c0 5-5 5-5 10a5 5 0 0 0 10 0c0-3-2-5-2-5 0 3-3 3-3-5Z"],
  spark: ["m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"],
  link: [
    "m9 15 6-6",
    "M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
  ],
  play: ["m9 5 10 7-10 7Z"],
  arrow: ["M5 12h14m-6-6 6 6-6 6"],
};
@Component({
  selector: "app-icon",
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    @for (path of iconPaths(); track $index) {
      <path [attr.d]="path" />
    }
  </svg>`,
  styles: [
    `
      :host {
        display: inline-flex;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppIconComponent {
  @Input() name = "book";
  iconPaths() {
    return paths[this.name] || paths.book;
  }
}
@Component({
  selector: "app-subject-badge",
  standalone: true,
  imports: [AppIconComponent],
  template: `<span class="badge"><app-icon name="book" /></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
      }
      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 13px;
        background: var(--primary-soft);
        color: var(--primary);
      }
    `,
  ],
})
export class SubjectBadgeComponent {
  @Input() subject = "";
}
