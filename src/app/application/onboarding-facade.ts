import { inject, Injectable } from "@angular/core";
import { StudyStore } from "../data/study-store";
import { SubjectNavigation } from "../data/subject-navigation";
import { onboardingStepFor } from "../onboarding";
import { EditorFacade } from "./editor-facade";
import { NavigationState } from "./navigation-state";
import { OnboardingState } from "./onboarding-state";
@Injectable()
export class OnboardingFacade {
  private store = inject(StudyStore);
  private navigation = inject(SubjectNavigation);
  private shell = inject(NavigationState);
  private editors = inject(EditorFacade);
  private onboarding = inject(OnboardingState);
  readonly activeSubjects = this.store.activeSubjects;
  readonly studyItems = this.store.queue;
  readonly cards = this.store.cards;
  readonly onboardingDismissed = this.onboarding.dismissed;
  onboardingStep() {
    return onboardingStepFor(
      this.onboardingDismissed(),
      this.activeSubjects(),
      this.studyItems(),
      this.cards(),
    );
  }
  dismissOnboarding() {
    this.onboarding.dismiss();
  }
  startFirstSubject() {
    this.shell.setTab("studyPlan");
    this.navigation.run((m) => m.openNew());
  }
  startFirstTopic() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.shell.setTab("studyPlan");
    this.navigation.run((m) => {
      m.openSubject(first);
      m.detailTab.set("topics");
      this.editors.openTopicForm(first.name);
    });
  }
  startFirstRoutine() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.shell.setTab("studyPlan");
    this.navigation.run((m) => m.edit(first));
  }
  startFirstCard() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.shell.setTab("studyPlan");
    this.editors.openCardEditor(first.deck_key || first.name);
  }
}
