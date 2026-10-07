import { Component, DestroyRef, Input, ViewChild, inject } from "@angular/core";
import { AppFacade } from "../app-facade";
import { AppIconComponent } from "../app-icon.component";
import { SubjectNavigation } from "../data/subject-navigation";
import { I18nPipe } from "../i18n.pipe";
import { SubjectManagerComponent } from "../subject-manager.component";
import { TopicEditorPageComponent } from "./topic-editor-page.component";
@Component({
  selector: "app-study-plan-page",
  standalone: true,
  imports: [
    TopicEditorPageComponent,
    AppIconComponent,
    I18nPipe,
    SubjectManagerComponent,
  ],
  templateUrl: "./study-plan-page.component.html",
  styles: [":host{display:contents}"],
})
export class StudyPlanPageComponent {
  @Input({ required: true }) vm!: Pick<
    AppFacade,
    | "addStudySubject"
    | "cardEditor"
    | "cards"
    | "closeStudyForm"
    | "completeStudyItem"
    | "editStudyItem"
    | "editingStudyId"
    | "newSubjectName"
    | "openCardEditor"
    | "openPractice"
    | "openSubject"
    | "openTopicForm"
    | "saveStudyItem"
    | "studyError"
    | "studyFormOpen"
    | "studyItems"
    | "studyLink"
    | "studyNotes"
    | "studyPriority"
    | "studySaving"
    | "studySubject"
    | "studySubjects"
    | "studyTitle"
    | "subjectFormOpen"
  >;
  private navigation = inject(SubjectNavigation);
  constructor() {
    inject(DestroyRef).onDestroy(() => this.navigation.detach());
  }
  @ViewChild(SubjectManagerComponent) set manager(
    value: SubjectManagerComponent | undefined,
  ) {
    if (value) this.navigation.attach(value);
  }
}
