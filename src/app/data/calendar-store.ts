import { Injectable, computed, inject, signal } from "@angular/core";
import { I18nService } from "../i18n.service";
import { StudyClock } from "../platform/study-clock-service";
import {
  buildCalendarDays,
  countStudyDaysInMonth,
  studyStreak,
} from "../study-history";
import { StudyStore } from "./study-store";
@Injectable()
export class CalendarStore {
  private clock = inject(StudyClock);
  private store = inject(StudyStore);
  private i18n = inject(I18nService);
  readonly month = signal(new Date(this.clock.today() + "T12:00:00"));
  readonly selectedDate = signal<string | null>(null);
  readonly monthLabel = computed(() =>
    this.month()
      .toLocaleDateString(this.i18n.language(), {
        month: "long",
        year: "numeric",
      })
      .replace(/^./, (v) => v.toUpperCase()),
  );
  readonly days = computed(() =>
    buildCalendarDays(this.month(), this.store.history(), this.clock.today()),
  );
  readonly selectedDay = computed(
    () =>
      this.store.history().find((d) => d.date === this.selectedDate()) || null,
  );
  readonly count = computed(() =>
    countStudyDaysInMonth(this.month(), this.store.history()),
  );
  readonly streak = computed(() =>
    studyStreak(this.store.history(), this.clock.today()),
  );
  change(offset: number) {
    const d = this.month();
    this.month.set(new Date(d.getFullYear(), d.getMonth() + offset, 1));
    this.selectedDate.set(null);
  }
}
