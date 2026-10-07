import { Component, Input, ViewChild, inject, DestroyRef } from "@angular/core";
import { TopicEditorPageComponent } from "../../subjects/topic-editor/topic-editor-page.component";
import { AppIconComponent } from "../../../app-icon.component";
import { AppFacade } from "../../../core/app-facade";
import { I18nPipe } from "../../../core/i18n.pipe";
import { SubjectManagerComponent } from "../../subjects/subject-manager/subject-manager.component";
import { SubjectNavigation } from "../../../core/data/subject-navigation";
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
  @Input({ required: true }) vm!: AppFacade;
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
