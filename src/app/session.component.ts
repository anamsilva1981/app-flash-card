import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppIconComponent } from "./app-icon.component";
import { AppComponent } from "./app.component";
import { AuthFlow } from "./application/auth-flow";
import { I18nPipe } from "./i18n.pipe";
import { LanguageSwitcherComponent } from "./language-switcher.component";
@Component({
  selector: "app-session",
  standalone: true,
  imports: [
    I18nPipe,
    LanguageSwitcherComponent,
    FormsModule,
    AppComponent,
    AppIconComponent,
  ],
  templateUrl: "./session.component.html",
})
export class SessionComponent extends AuthFlow {}
