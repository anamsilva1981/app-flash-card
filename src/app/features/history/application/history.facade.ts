import { Injectable, inject } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { I18nService } from "../../../core/i18n/i18n.service";
import { ReviewStore } from "../../review/public-api";
import { CalendarStore } from "./calendar-store";
import { sortStudyItems } from "../../../shared/domain/study-plan";

@Injectable()
export class HistoryFacade {
  private store = inject(StudyStore);
  private review = inject(ReviewStore);
  private calendar = inject(CalendarStore);
  private i18n = inject(I18nService);

  readonly totalDue = this.review.totalDue;
  readonly completedStudyItems = () =>
    sortStudyItems(
      this.store.queue().filter((item) => item.status === "done"),
      true,
    );
  readonly history = this.store.history;
  readonly historyMonth = this.calendar.month;
  readonly selectedHistoryDate = this.calendar.selectedDate;
  readonly monthLabel = this.calendar.monthLabel;
  readonly calendarDays = this.calendar.days;
  readonly selectedHistoryDay = this.calendar.selectedDay;
  readonly studyDaysInMonth = this.calendar.count;
  readonly streak = this.calendar.streak;

  changeHistoryMonth(offset: number) {
    this.calendar.change(offset);
  }

  selectHistoryDate(date: string | null) {
    if (date) this.selectedHistoryDate.set(date);
  }

  formatDate(date: string) {
    return new Date(date + "T12:00:00").toLocaleDateString(
      this.i18n.language(),
    );
  }

  prepareForOpen() {
    if (this.selectedHistoryDate()) return;
    const latest = this.history().find(
      (day) => day.learning.length || day.reviews.length,
    );
    if (!latest) return;
    const date = new Date(latest.date + "T12:00:00");
    this.historyMonth.set(new Date(date.getFullYear(), date.getMonth(), 1));
  }
}
