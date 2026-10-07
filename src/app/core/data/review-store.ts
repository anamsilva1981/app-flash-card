import { Injectable, inject, signal, computed } from "@angular/core";
import { StudyStore } from "./study-store";
import {
  buildReviewSession,
  dueReviewCards,
  intervalFor,
  totalDueCards,
} from "../domain/review/review-schedule";
import { cardsForSubject, cardTopics } from "../domain/cards/flashcard";
import { studyDate } from "../domain/time/study-clock";
import { cached } from "../sync";
import { Rating } from "@shared/models";

@Injectable()
export class ReviewStore {
  private store = inject(StudyStore);
  readonly subject = signal<string | null>(null);
  readonly topic = signal("Todos");
  readonly flipped = signal(false);
  readonly explanationOpen = signal(false);
  readonly sessionLimit = signal(cached("review-session-limit", 10));
  readonly sessionIds = signal<number[]>([]);
  readonly sessionPosition = signal(0);
  readonly practice = signal(false);
  readonly subjectCards = computed(() =>
    cardsForSubject(this.store.cards(), this.subject()),
  );
  readonly topics = computed(() => cardTopics(this.subjectCards()));
  readonly dueCards = computed(() =>
    dueReviewCards(
      this.store.cards(),
      this.subject(),
      this.topic(),
      studyDate(),
    ),
  );
  readonly totalDue = computed(() =>
    totalDueCards(this.store.cards(), this.store.activeSubjects(), studyDate()),
  );
  readonly card = computed(() =>
    this.store
      .cards()
      .find((c) => c.id === this.sessionIds()[this.sessionPosition()]),
  );
  readonly progress = computed(
    () =>
      Math.min(this.sessionPosition() + 1, this.sessionIds().length) +
      " / " +
      this.sessionIds().length,
  );
  start() {
    const cards = this.practice()
      ? this.subjectCards().filter(
          (c) => this.topic() === "Todos" || c.topic === this.topic(),
        )
      : this.dueCards();
    this.sessionIds.set(buildReviewSession(cards, this.sessionLimit()));
    this.sessionPosition.set(0);
    this.reset();
  }
  reset() {
    this.flipped.set(false);
    this.explanationOpen.set(false);
  }
  nextInterval(r: Rating) {
    return intervalFor(this.card()?.interval || 0, r);
  }
}
