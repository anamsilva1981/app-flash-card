import { Component, OnInit, ViewEncapsulation, inject } from "@angular/core";
import { AppFacade } from "./app.facade";
import { AppIconComponent } from "./shared/components/app-icon/app-icon.component";
import { StudyStore } from "./core/state/study-store";
import { StudyRepository } from "./core/application/study-repository";
import { AppNavigation } from "./core/state/app-navigation";
import { ReminderService } from "./core/notifications/reminder-service";
import { I18nPipe } from "./core/i18n/i18n.pipe";
import { HomePageComponent } from "./features/home/public-api";
import { StudyPlanPageComponent } from "./features/study-plan/public-api";
import { ProgressPageComponent } from "./features/progress/public-api";
import { HistoryPageComponent } from "./features/history/public-api";
import { SettingsPageComponent } from "./features/settings/public-api";
import { ReviewPageComponent } from "./features/review/public-api";
import { CardEditorPageComponent } from "./features/cards/public-api";
import { ReviewStore } from "./features/review/application/review-store";
import { CalendarStore } from "./features/history/application/calendar-store";
import { SubjectNavigation } from "./features/subjects/application/subject-navigation";
import { ReviewFacade } from "./features/review/application/review.facade";
import { CardsFacade } from "./features/cards/application/cards.facade";
import { StudyPlanFacade } from "./features/study-plan/application/study-plan.facade";
import { HomeFacade } from "./features/home/application/home.facade";
import { HistoryFacade } from "./features/history/application/history.facade";
import { ProgressFacade } from "./features/progress/application/progress.facade";
import { SettingsFacade } from "./features/settings/application/settings.facade";
@Component({
  selector: "app-root",
  standalone: true,
  providers: [
    AppFacade,
    AppNavigation,
    StudyStore,
    StudyRepository,
    ReviewStore,
    CalendarStore,
    SubjectNavigation,
    ReminderService,
    ReviewFacade,
    CardsFacade,
    StudyPlanFacade,
    HomeFacade,
    HistoryFacade,
    ProgressFacade,
    SettingsFacade,
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
