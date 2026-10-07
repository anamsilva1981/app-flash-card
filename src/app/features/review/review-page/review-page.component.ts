import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../app-icon.component";
import { AppFacade } from "../../../app-facade";
import { I18nPipe } from "../../../i18n.pipe";
@Component({
  selector: "app-review-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./review-page.component.html",
  styles: [":host{display:contents}"],
})
export class ReviewPageComponent {
  @Input({ required: true }) vm!: AppFacade;
}
