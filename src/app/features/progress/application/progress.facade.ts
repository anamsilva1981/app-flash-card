import { Injectable, inject } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { ReviewStore } from "../../review/application/review-store";
import {
  countDueCards,
  countSubjectCards,
} from "../../../shared/domain/flashcard";
import { studyDate } from "../../../shared/utils/study-clock";

@Injectable()
export class ProgressFacade {
  private store = inject(StudyStore);
  private review = inject(ReviewStore);

  readonly totalDue = this.review.totalDue;
  readonly cards = this.store.cards;
  readonly history = this.store.history;
  readonly activeSubjects = this.store.activeSubjects;

  subjectDue(name: string) {
    return countDueCards(this.cards(), name, studyDate());
  }

  subjectTotal(name: string) {
    return countSubjectCards(this.cards(), name);
  }
}
