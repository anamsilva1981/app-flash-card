import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { AppFacade } from "../../../core/app-facade";
import { I18nPipe } from "../../../core/i18n.pipe";
@Component({
  selector: "app-topic-editor-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./topic-editor-page.component.html",
  styles: [":host{display:contents}"],
})
export class TopicEditorPageComponent {
  @Input({ required: true }) vm!: AppFacade;
}
