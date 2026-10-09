import { Component, OnInit, ViewEncapsulation, inject } from "@angular/core";
import { AppFacade } from "./app.facade";
import { AppIconComponent } from "./shared/components/app-icon/app-icon.component";
import { StudyStore } from "./core/state/study-store";
import { StudyRepository } from "./core/application/study-repository";
import { AppNavigation } from "./core/state/app-navigation";
import { ReminderService } from "./core/notifications/reminder-service";
import { I18nPipe } from "./core/i18n/i18n.pipe";
import { HomeFacade, HomePageComponent } from "./features/home/public-api";
import { StudyPlanFacade, StudyPlanPageComponent } from "./features/study-plan/public-api";
import { ProgressFacade, ProgressPageComponent } from "./features/progress/public-api";
import { CalendarStore, HistoryFacade, HistoryPageComponent } from "./features/history/public-api";
import { SettingsFacade, SettingsPageComponent } from "./features/settings/public-api";
import { ReviewFacade, ReviewPageComponent, ReviewStore } from "./features/review/public-api";
import { CardEditorPageComponent, CardsFacade } from "./features/cards/public-api";
import { SubjectNavigation } from "./features/subjects/public-api";
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
