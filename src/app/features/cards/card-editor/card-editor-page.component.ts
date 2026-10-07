import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { CardsFacade } from "../application/cards.facade";
@Component({
  selector: "app-card-editor-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./card-editor-page.component.html",
  styles: [":host{display:contents}"],
})
export class CardEditorPageComponent {
  @Input({ required: true }) vm!: CardsFacade;
}
