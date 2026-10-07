import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { AppIconComponent, SubjectBadgeComponent } from "../../../app-icon.component";
import { AppFacade } from "../../../core/app-facade";
import { I18nPipe } from "../../../core/i18n.pipe";
@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [
    FormsModule,
    A11yModule,
    AppIconComponent,
    SubjectBadgeComponent,
    I18nPipe,
  ],
  templateUrl: "./home-page.component.html",
  styles: [":host{display:contents}"],
})
export class HomePageComponent {
  @Input({ required: true }) vm!: AppFacade;
}
