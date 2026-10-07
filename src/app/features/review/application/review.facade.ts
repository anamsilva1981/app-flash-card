import { Injectable, inject, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { StudyRepository } from "../../../core/application/study-repository";
import { AppNavigation } from "../../../core/state/app-navigation";
import { I18nService } from "../../../core/i18n/i18n.service";
import { cache } from "../../../core/persistence/sync";
import { studyDate } from "../../../shared/utils/study-clock";
import { Rating } from "../../../shared/models";
import { ReviewStore } from "./review-store";

@Injectable()
export class ReviewFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private review = inject(ReviewStore);
  private navigation = inject(AppNavigation);
  private i18n = inject(I18nService);

  readonly subject = this.review.subject;
  readonly topic = this.review.topic;
  readonly flipped = this.review.flipped;
  readonly explanationOpen = this.review.explanationOpen;
  readonly sessionLimit = this.review.sessionLimit;
  readonly sessionIds = this.review.sessionIds;
  readonly sessionPosition = this.review.sessionPosition;
  readonly practice = this.review.practice;
  readonly subjectCards = this.review.subjectCards;
  readonly topics = this.review.topics;
  readonly dueCards = this.review.dueCards;
  readonly totalDue = this.review.totalDue;
  readonly card = this.review.card;
  readonly progress = this.review.progress;
  readonly rating = signal(false);

  subjectLabel() {
    const key = this.subject();
    return (
      this.store.subjects().find((subject) =>
        (subject.deck_key || subject.name) === key
      )?.name || key || ""
    );
  }

  reviewLabel() {
    return this.topic() === "Todos"
      ? this.subjectLabel()
      : `${this.subjectLabel()} — ${this.topic()}`;
  }

  openDeck(name: string) {
    if (this.review.dueCards().some((card) => card.subject === name)) {
      this.openSubject(name);
    } else {
      this.openPractice(name);
    }
  }

  openSubject(name: string) {
    this.subject.set(name);
    this.topic.set("Todos");
    this.practice.set(false);
    this.startSession();
  }

  openPractice(name: string) {
    this.openSubject(name);
    this.practice.set(true);
    this.startSession();
  }

  back() {
    this.subject.set(null);
    this.topic.set("Todos");
    this.review.reset();
    this.navigation.setTab("home");
  }

  choose(value: string) {
    this.topic.set(value);
    this.startSession();
  }

  reveal() {
    this.flipped.update((value) => !value);
    this.explanationOpen.set(false);
  }

  toggleExplanation() {
    this.explanationOpen.update((value) => !value);
  }

  setSessionLimit(value: number) {
    this.sessionLimit.set(value);
    cache("review-session-limit", value);
    if (this.subject()) this.startSession();
  }

  startSession() {
    this.review.start();
  }

  nextInterval(rating: Rating) {
    return this.review.nextInterval(rating);
  }

  async rate(rating: Rating) {
    const card = this.card();
    if (!card || this.rating()) return;
    this.rating.set(true);
    try {
      if (!this.practice()) {
        const days = this.nextInterval(rating);
        const date = new Date(studyDate() + "T12:00:00Z");
        date.setUTCDate(date.getUTCDate() + days);
        await this.repository.rateCard(
          { ...card, due: date.toISOString().slice(0, 10), interval: days },
          this.reviewLabel(),
          rating,
        );
      }
      this.sessionPosition.update((value) => value + 1);
      this.review.reset();
    } catch {
      this.store.error.set(this.i18n.t("error.save"));
    } finally {
      this.rating.set(false);
    }
  }
}
