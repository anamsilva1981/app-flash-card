import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../app-icon.component";
import { AppFacade } from "../../../core/app-facade";
import { I18nPipe } from "../../../core/i18n.pipe";
import { AccountPanelComponent } from "../../account/account-panel/account-panel.component";
@Component({
  selector: "app-settings-page",
  standalone: true,
  imports: [
    FormsModule,
    A11yModule,
    AppIconComponent,
    I18nPipe,
    AccountPanelComponent,
  ],
  templateUrl: "./settings-page.component.html",
  styles: [":host{display:contents}"],
})
export class SettingsPageComponent {
  @Input({ required: true }) vm!: AppFacade;
}
