import { A11yModule } from "@angular/cdk/a11y";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppFacade } from "../app-facade";
import { AppIconComponent } from "../app-icon.component";
import { I18nPipe } from "../i18n.pipe";
@Component({
  selector: "app-topic-editor-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./topic-editor-page.component.html",
  styles: [":host{display:contents}"],
})
export class TopicEditorPageComponent {
  @Input({ required: true }) vm!: Pick<
    AppFacade,
    | "addStudySubject"
    | "closeStudyForm"
    | "editingStudyId"
    | "newSubjectName"
    | "saveStudyItem"
    | "studyError"
    | "studyFormOpen"
    | "studyLink"
    | "studyNotes"
    | "studyPriority"
    | "studySaving"
    | "studySubject"
    | "studySubjects"
    | "studyTitle"
    | "subjectFormOpen"
  >;
}
