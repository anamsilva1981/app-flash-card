import { inject, Injectable, signal } from "@angular/core";
import { ReviewStore } from "../data/review-store";
import { StudyRepository } from "../data/study-repository";
import { StudyStore } from "../data/study-store";
import { countDueCards, countSubjectCards } from "../flashcard";
import { I18nService } from "../i18n.service";
import { Rating } from "../models";
import { studyDate } from "../study-clock";
import { nextStudyItem, pendingStudyItems } from "../study-plan";
import { cache } from "../sync";
import { NavigationState } from "./navigation-state";
@Injectable()
export class ReviewFacade {
  private repository = inject(StudyRepository);
  private store = inject(StudyStore);
  private review = inject(ReviewStore);
  private navigation = inject(NavigationState);
  readonly subjectConfigs = this.store.subjects;
  readonly cards = this.store.cards;
  readonly studyItems = this.store.queue;
  readonly i18n = inject(I18nService);
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
  subjectLabel() {
    const key = this.subject();
    return (
      this.subjectConfigs().find(
        (s) => s.id === key || (s.deck_key || s.name) === key,
      )?.name ||
      key ||
      ""
    );
  }
  topicLabel(id: string) {
    return id === "__all__"
      ? this.i18n.t("ui.todos")
      : this.studyItems().find((topic) => topic.id === id)?.title ||
          this.subjectCards().find((card) => card.topic_id === id)?.topic ||
          id;
  }
  reviewLabel() {
    return this.topic() === "__all__"
      ? this.subjectLabel()
      : `${this.subjectLabel()} — ${this.topicLabel(this.topic())}`;
  }
  subjectDue = (name: string) =>
    countDueCards(this.cards(), name, studyDate(), this.subjectConfigs());
  subjectTotal = (name: string) =>
    countSubjectCards(this.cards(), name, this.subjectConfigs());
  nextTopic(name: string) {
    return nextStudyItem(this.studyItems(), name);
  }
  pendingTopics(name: string) {
    return pendingStudyItems(this.studyItems(), name).length;
  }
  openDeck(name: string) {
    if (this.subjectDue(name)) this.openSubject(name);
    else this.openPractice(name);
  }
  openSubject(name: string) {
    this.subject.set(
      this.subjectConfigs().find(
        (item) =>
          item.id === name || item.name === name || item.deck_key === name,
      )?.id || name,
    );
    this.topic.set("__all__");
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
    this.topic.set("__all__");
    this.review.reset();
    this.navigation.setTab("home");
  }
  choose(value: string) {
    this.topic.set(value);
    this.startSession();
  }
  reveal() {
    this.flipped.update((v) => !v);
    this.explanationOpen.set(false);
  }
  toggleExplanation() {
    this.explanationOpen.update((v) => !v);
  }
  setSessionLimit(value: number) {
    this.sessionLimit.set(value);
    cache("review-session-limit", value);
    if (this.subject()) this.startSession();
  }
  startSession() {
    this.review.start();
  }
  nextInterval(r: Rating) {
    return this.review.nextInterval(r);
  }
  readonly rating = signal(false);
  async rate(r: Rating) {
    const card = this.card();
    if (!card || this.rating()) return;
    this.rating.set(true);
    try {
      if (!this.practice()) {
        const days = this.nextInterval(r);
        const date = new Date(studyDate() + "T12:00:00Z");
        date.setUTCDate(date.getUTCDate() + days);
        await this.repository.rateCard(
          { ...card, due: date.toISOString().slice(0, 10), interval: days },
          this.reviewLabel(),
          r,
        );
      }
      this.sessionPosition.update((v) => v + 1);
      this.review.reset();
    } catch {
      this.store.error.set(this.i18n.t("error.save"));
    } finally {
      this.rating.set(false);
    }
  }
}
