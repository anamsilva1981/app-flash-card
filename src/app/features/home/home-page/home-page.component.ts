import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import {
  AppIconComponent,
  SubjectBadgeComponent,
} from "../../../shared/components/app-icon/app-icon.component";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { HomeFacade } from "../application/home.facade";
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
  styleUrl: "./home-page.component.css",
})
export class HomePageComponent {
  @Input({ required: true }) vm!: HomeFacade;
}
