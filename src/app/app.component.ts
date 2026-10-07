import { Component, inject, OnInit, ViewEncapsulation } from "@angular/core";
import { AppFacade } from "./app-facade";
import { AppIconComponent } from "./app-icon.component";
import { BackupFacade } from "./application/backup-facade";
import { EditorFacade } from "./application/editor-facade";
import { NavigationState } from "./application/navigation-state";
import { OnboardingFacade } from "./application/onboarding-facade";
import { OnboardingState } from "./application/onboarding-state";
import { ReviewFacade } from "./application/review-facade";
import { CalendarStore } from "./data/calendar-store";
import { ReminderService } from "./data/reminder-service";
import { ReviewStore } from "./data/review-store";
import { StudyRepository } from "./data/study-repository";
import { StudyStore } from "./data/study-store";
import { SubjectNavigation } from "./data/subject-navigation";
import { CardEditorPageComponent } from "./features/card-editor-page.component";
import { HistoryPageComponent } from "./features/history-page.component";
import { HomePageComponent } from "./features/home-page.component";
import { ProgressPageComponent } from "./features/progress-page.component";
import { ReviewPageComponent } from "./features/review-page.component";
import { SettingsPageComponent } from "./features/settings-page.component";
import { StudyPlanPageComponent } from "./features/study-plan-page.component";
import { I18nPipe } from "./i18n.pipe";
@Component({
  selector: "app-root",
  standalone: true,
  providers: [
    EditorFacade,
    BackupFacade,
    ReviewFacade,
    OnboardingFacade,
    OnboardingState,
    NavigationState,
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
