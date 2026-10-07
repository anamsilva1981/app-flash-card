import { Component, inject, OnInit, ViewEncapsulation } from "@angular/core";
import { AppFacade } from "./core/app-facade";
import { AppIconComponent } from "./shared/components/app-icon/app-icon.component";
import { StudyStore } from "./core/data/study-store";
import { StudyRepository } from "./core/data/study-repository";
import { ReviewStore } from "./core/data/review-store";
import { CalendarStore } from "./core/data/calendar-store";
import { SubjectNavigation } from "./core/data/subject-navigation";
import { ReminderService } from "./core/data/reminder-service";
import { I18nPipe } from "./core/i18n.pipe";
import { HomePageComponent } from "./features/home/home-page/home-page.component";
import { StudyPlanPageComponent } from "./features/study-plan/study-plan-page/study-plan-page.component";
import { ProgressPageComponent } from "./features/progress/progress-page/progress-page.component";
import { HistoryPageComponent } from "./features/history/history-page/history-page.component";
import { SettingsPageComponent } from "./features/settings/settings-page/settings-page.component";
import { ReviewPageComponent } from "./features/review/review-page/review-page.component";
import { CardEditorPageComponent } from "./features/cards/card-editor/card-editor-page.component";
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
