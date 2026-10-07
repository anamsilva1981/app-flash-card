import { Injectable, inject, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { AppNavigation, AppTab } from "../../../core/state/app-navigation";
import { I18nService } from "../../../core/i18n/i18n.service";
import { cached, cache } from "../../../core/persistence/sync";
import { studyDate } from "../../../shared/utils/study-clock";
import {
  countDueCards,
  countSubjectCards,
} from "../../../shared/domain/flashcard";
import {
  nextStudyItem,
  pendingStudyItems,
} from "../../../shared/domain/study-plan";
import { onboardingStepFor } from "../domain/onboarding";
import { ReviewStore } from "../../review/application/review-store";
import { ReviewFacade } from "../../review/application/review.facade";
import { CalendarStore } from "../../history/application/calendar-store";
import { StudyPlanFacade } from "../../study-plan/application/study-plan.facade";
import { CardsFacade } from "../../cards/application/cards.facade";
import { SubjectNavigation } from "../../subjects/application/subject-navigation";

@Injectable()
export class HomeFacade {
  private store = inject(StudyStore);
  private navigation = inject(AppNavigation);
  private review = inject(ReviewStore);
  private reviewFacade = inject(ReviewFacade);
  private calendar = inject(CalendarStore);
  private studyPlan = inject(StudyPlanFacade);
  private cardsFacade = inject(CardsFacade);
  private subjectNavigation = inject(SubjectNavigation);
  readonly i18n = inject(I18nService);

  readonly deckPicker = signal(false);
  readonly onboardingDismissed = signal(cached("onboarding-dismissed", false));
  readonly displayName = this.store.displayName;
  readonly activeSubjects = this.store.activeSubjects;
  readonly todaysSubjects = this.store.todaysSubjects;
  readonly totalDue = this.review.totalDue;
  readonly sessionLimit = this.review.sessionLimit;
  readonly streak = this.calendar.streak;

  subjectDue(name: string) {
    return countDueCards(this.store.cards(), name, studyDate());
  }

  subjectTotal(name: string) {
    return countSubjectCards(this.store.cards(), name);
  }

  nextTopic(name: string) {
    return nextStudyItem(this.store.queue(), name);
  }

  pendingTopics(name: string) {
    return pendingStudyItems(this.store.queue(), name).length;
  }

  openDeck(name: string) {
    this.reviewFacade.openDeck(name);
  }

  setTab(tab: AppTab) {
    this.navigation.setTab(tab);
    if (tab === "home") this.deckPicker.set(false);
  }

  goToSubject(name: string) {
    this.setTab("studyPlan");
    this.subjectNavigation.run((manager) => {
      const subject = manager.subjects().find((item) => item.name === name);
      if (subject) {
        manager.openSubject(subject);
        manager.detailTab.set("topics");
      }
    });
  }

  openStudyForm() {
    this.studyPlan.openStudyForm();
  }

  onboardingStep() {
    return onboardingStepFor(
      this.onboardingDismissed(),
      this.activeSubjects(),
      this.store.queue(),
      this.store.cards(),
    );
  }

  dismissOnboarding() {
    cache("onboarding-dismissed", true);
    this.onboardingDismissed.set(true);
  }

  startFirstSubject() {
    this.setTab("studyPlan");
    this.subjectNavigation.run((manager) => manager.openNew());
  }

  startFirstTopic() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.setTab("studyPlan");
    this.subjectNavigation.run((manager) => {
      manager.openSubject(first);
      manager.detailTab.set("topics");
      this.studyPlan.openTopicForm(first.name);
    });
  }

  startFirstRoutine() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.setTab("studyPlan");
    this.subjectNavigation.run((manager) => manager.edit(first));
  }

  startFirstCard() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.setTab("studyPlan");
    this.cardsFacade.openCardEditor(first.deck_key || first.name);
  }
}
