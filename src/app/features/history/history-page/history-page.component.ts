import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { HistoryFacade } from "../application/history.facade";
@Component({
  selector: "app-history-page",
  standalone: true,
  imports: [FormsModule, A11yModule, AppIconComponent, I18nPipe],
  templateUrl: "./history-page.component.html",
  styles: [":host{display:contents}"],
})
export class HistoryPageComponent {
  @Input({ required: true }) vm!: HistoryFacade;
}
