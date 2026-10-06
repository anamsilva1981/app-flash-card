import { Component, inject, OnInit, ViewEncapsulation } from "@angular/core";
import { AppFacade } from "./app-facade";
import { AppIconComponent } from "./app-icon.component";
import { StudyStore } from "./data/study-store";
import { StudyRepository } from "./data/study-repository";
import { ReviewStore } from "./data/review-store";
import { CalendarStore } from "./data/calendar-store";
import { SubjectNavigation } from "./data/subject-navigation";
import { ReminderService } from "./data/reminder-service";
import { I18nPipe } from "./i18n.pipe";
import { HomePageComponent } from "./features/home-page.component";
import { StudyPlanPageComponent } from "./features/study-plan-page.component";
import { ProgressPageComponent } from "./features/progress-page.component";
import { HistoryPageComponent } from "./features/history-page.component";
import { SettingsPageComponent } from "./features/settings-page.component";
import { ReviewPageComponent } from "./features/review-page.component";
import { CardEditorPageComponent } from "./features/card-editor-page.component";
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
