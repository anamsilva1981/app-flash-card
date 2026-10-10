import { Injectable, inject, computed, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { I18nService } from "../../../core/i18n/i18n.service";
import {
  buildCalendarDays,
  countStudyDaysInMonth,
  studyStreak,
} from "../domain/study-history";
import { studyDate } from "../../../shared/utils/study-clock";

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
      .replace(/^./, (value) => value.toUpperCase()),
  );
  readonly days = computed(() =>
    buildCalendarDays(this.month(), this.store.history(), studyDate()),
  );
  readonly selectedDay = computed(
    () =>
      this.store.history().find((day) => day.date === this.selectedDate()) ||
      null,
  );
  readonly count = computed(() =>
    countStudyDaysInMonth(this.month(), this.store.history()),
  );
  readonly streak = computed(() =>
    studyStreak(this.store.history(), studyDate()),
  );
  change(offset: number) {
    const date = this.month();
    this.month.set(new Date(date.getFullYear(), date.getMonth() + offset, 1));
    this.selectedDate.set(null);
  }
}
