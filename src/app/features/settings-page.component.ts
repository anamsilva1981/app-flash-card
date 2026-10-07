import { A11yModule } from "@angular/cdk/a11y";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AccountPanelComponent } from "../account-panel.component";
import { AppFacade } from "../app-facade";
import { AppIconComponent } from "../app-icon.component";
import { I18nPipe } from "../i18n.pipe";
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
  @Input({ required: true }) vm!: Pick<
    AppFacade,
    | "backupMessage"
    | "exportBackup"
    | "importBackup"
    | "legacyAvailable"
    | "recoverLegacy"
    | "syncStatus"
  >;
}
