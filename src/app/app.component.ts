import { Component, OnInit, ViewEncapsulation, inject } from "@angular/core";
import { AppFacade } from "./core/app-facade";
import { AppIconComponent } from "./shared/components/app-icon/app-icon.component";
import { StudyStore } from "./core/data/study-store";
import { StudyRepository } from "./core/data/study-repository";
import { ReviewStore } from "./core/data/review-store";
import { CalendarStore } from "./core/data/calendar-store";
import { SubjectNavigation } from "./core/data/subject-navigation";
import { ReminderService } from "./core/data/reminder-service";
import { I18nPipe } from "./core/i18n.pipe";
import { HomePageComponent } from "./features/home/public-api";
import { StudyPlanPageComponent } from "./features/study-plan/public-api";
import { ProgressPageComponent } from "./features/progress/public-api";
import { HistoryPageComponent } from "./features/history/public-api";
import { SettingsPageComponent } from "./features/settings/public-api";
import { ReviewPageComponent } from "./features/review/public-api";
import { CardEditorPageComponent } from "./features/cards/public-api";
@Component({
  selector: "app-root",
  standalone: true,
  providers: [
    AppFacade,
    StudyStore,
    StudyRepository,
    ReviewStore,
    CalendarStore,
    SubjectNavigation,
    ReminderService,
  ],
  imports: [
    AppIconComponent,
    I18nPipe,
    HomePageComponent,
    StudyPlanPageComponent,
    ProgressPageComponent,
    HistoryPageComponent,
    SettingsPageComponent,
    ReviewPageComponent,
    CardEditorPageComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  readonly vm = inject(AppFacade);
  ngOnInit() {
    this.vm.initialize();
  }
}
