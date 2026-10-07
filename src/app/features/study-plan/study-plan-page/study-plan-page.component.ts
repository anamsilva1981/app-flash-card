import { Component, DestroyRef, Input, ViewChild, inject } from "@angular/core";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import {
  SubjectManagerComponent,
  TopicEditorPageComponent,
  SubjectNavigation,
} from "../../subjects/public-api";
import { StudyPlanFacade } from "../application/study-plan.facade";
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
  @Input({ required: true }) vm!: StudyPlanFacade;
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
