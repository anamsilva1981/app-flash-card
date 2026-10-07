import { Component, DestroyRef, Input, ViewChild, inject } from "@angular/core";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { AppFacade } from "../../../core/app-facade";
import { I18nPipe } from "../../../core/i18n.pipe";
import {
  SubjectManagerComponent,
  TopicEditorPageComponent,
} from "../../subjects/public-api";
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
