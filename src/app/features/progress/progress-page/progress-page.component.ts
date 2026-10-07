import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import {
  AppIconComponent,
  SubjectBadgeComponent,
} from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { ProgressFacade } from "../application/progress.facade";
@Component({
  selector: "app-progress-page",
  standalone: true,
  imports: [
    FormsModule,
    A11yModule,
    AppIconComponent,
    SubjectBadgeComponent,
    I18nPipe,
  ],
  templateUrl: "./progress-page.component.html",
  styles: [":host{display:contents}"],
})
export class ProgressPageComponent {
  @Input({ required: true }) vm!: ProgressFacade;
}
