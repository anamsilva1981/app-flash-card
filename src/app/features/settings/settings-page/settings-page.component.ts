import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { LanguageSwitcherComponent } from "../../../core/i18n/language-switcher.component";
import { ThemeSwitcherComponent } from "../../../core/theme/theme-switcher.component";
import { AccountPanelComponent } from "../../account/public-api";
import { SettingsFacade } from "../application/settings.facade";
@Component({
  selector: "app-settings-page",
  standalone: true,
  imports: [
    FormsModule,
    A11yModule,
    AppIconComponent,
    I18nPipe,
    LanguageSwitcherComponent,
    ThemeSwitcherComponent,
    AccountPanelComponent,
  ],
  templateUrl: "./settings-page.component.html",
  styleUrl: "./settings-page.component.css",
})
export class SettingsPageComponent {
  @Input({ required: true }) vm!: SettingsFacade;
}
