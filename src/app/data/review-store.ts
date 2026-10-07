import { computed, inject, Injectable, signal } from "@angular/core";
import { cardsForSubject, cardTopics } from "../flashcard";
import { StudyClock } from "../platform/study-clock-service";
import {
  buildReviewSession,
  dueReviewCards,
  intervalFor,
  totalDueCards,
} from "../review-schedule";
import { cached } from "../sync";
import { StudyStore } from "./study-store";
@Injectable()
export class ReviewStore {
  private clock = inject(StudyClock);
  private store = inject(StudyStore);
  readonly subject = signal<string | null>(null);
  readonly topic = signal("__all__");
  readonly flipped = signal(false);
  readonly explanationOpen = signal(false);
  readonly sessionLimit = signal(cached("review-session-limit", 10));
  readonly sessionIds = signal<number[]>([]);
  readonly sessionPosition = signal(0);
  readonly practice = signal(false);
  readonly subjectCards = computed(() =>
    cardsForSubject(this.store.cards(), this.subject(), this.store.subjects()),
  );
  readonly topics = computed(() => cardTopics(this.subjectCards()));
  readonly dueCards = computed(() =>
    dueReviewCards(
      this.store.cards(),
      this.subject(),
      this.topic(),
      this.clock.today(),
      this.store.subjects(),
    ),
  );
  readonly totalDue = computed(() =>
    totalDueCards(
      this.store.cards(),
      this.store.activeSubjects(),
      this.clock.today(),
    ),
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
          (c) =>
            this.topic() === "__all__" ||
            (c.topic_id || c.topic) === this.topic(),
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
  nextInterval(r: import("../models").Rating) {
    return intervalFor(this.card()?.interval || 0, r);
  }
}
