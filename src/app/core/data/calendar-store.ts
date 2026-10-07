import { Injectable, inject, computed, signal } from "@angular/core";
import { StudyStore } from "./study-store";
import { I18nService } from "../i18n.service";
import {
  buildCalendarDays,
  countStudyDaysInMonth,
  studyStreak,
} from "../domain/history/study-history";
import { studyDate } from "../domain/time/study-clock";

@Injectable()
export class CalendarStore {
  private store = inject(StudyStore);
  private i18n = inject(I18nService);
  readonly month = signal(new Date(studyDate() + "T12:00:00"));
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
    buildCalendarDays(this.month(), this.store.history(), studyDate()),
  );
  readonly selectedDay = computed(
    () =>
      this.store.history().find((d) => d.date === this.selectedDate()) || null,
  );
  readonly count = computed(() =>
    countStudyDaysInMonth(this.month(), this.store.history()),
  );
  readonly streak = computed(() =>
    studyStreak(this.store.history(), studyDate()),
  );
  change(offset: number) {
    const d = this.month();
    this.month.set(new Date(d.getFullYear(), d.getMonth() + offset, 1));
    this.selectedDate.set(null);
  }
}
