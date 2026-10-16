import { Injectable, inject, computed } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { ReviewStore } from "../../review/public-api";
import {
  countDueCards,
  countSubjectCards,
} from "../../../shared/domain/flashcard";
import { studyDate } from "../../../shared/utils/study-clock";
import { levelForXp } from "../../../shared/domain/gamification";

@Injectable()
export class ProgressFacade {
  private store = inject(StudyStore);
  private review = inject(ReviewStore);

  readonly totalDue = this.review.totalDue;
  readonly cards = this.store.cards;
  readonly history = this.store.history;
  readonly activeSubjects = this.store.activeSubjects;
  readonly xp = this.store.xp;
  readonly todayReviews = this.store.todayReviews;
  readonly todayCorrect = this.store.todayCorrect;
  readonly level = computed(() => levelForXp(this.xp()));

  subjectDue(name: string) {
    return countDueCards(this.cards(), name, studyDate());
  }

  subjectTotal(name: string) {
    return countSubjectCards(this.cards(), name);
  }
}
