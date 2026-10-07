import { A11yModule } from "@angular/cdk/a11y";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppFacade } from "../app-facade";
import { AppIconComponent } from "../app-icon.component";
import { I18nPipe } from "../i18n.pipe";
@Component({
  selector: "app-card-editor-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./card-editor-page.component.html",
  styles: [":host{display:contents}"],
})
export class CardEditorPageComponent {
  @Input({ required: true }) vm!: Pick<
    AppFacade,
    "activeSubjects" | "cardDraft" | "cardEditor" | "cardError" | "saveCard"
  >;
}
