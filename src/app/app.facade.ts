import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SwUpdate } from "@angular/service-worker";
import { StudyStore } from "./core/state/study-store";
import { StudyRepository } from "./core/application/study-repository";
import { AppNavigation, AppTab } from "./core/state/app-navigation";
import { ReminderService } from "./core/notifications/reminder-service";
import { accountSession } from "./core/auth/account";
import {
  cached,
  startSyncLifecycle,
  syncStatus,
} from "./core/persistence/sync";
import { HomeFacade } from "./features/home/public-api";
import { StudyPlanFacade } from "./features/study-plan/public-api";
import { ProgressFacade } from "./features/progress/public-api";
import { HistoryFacade } from "./features/history/public-api";
import { SettingsFacade } from "./features/settings/public-api";
import { ReviewFacade } from "./features/review/public-api";
import { CardsFacade } from "./features/cards/public-api";

@Injectable()
export class AppFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private navigation = inject(AppNavigation);
  private reminders = inject(ReminderService);
  private updates = inject(SwUpdate);
  private destroyRef = inject(DestroyRef);

  readonly home = inject(HomeFacade);
  readonly studyPlan = inject(StudyPlanFacade);
  readonly progress = inject(ProgressFacade);
  readonly history = inject(HistoryFacade);
  readonly settings = inject(SettingsFacade);
  readonly review = inject(ReviewFacade);
  readonly cards = inject(CardsFacade);

  readonly activeTab = this.navigation.activeTab;
  readonly subject = this.review.subject;
  readonly cardEditor = this.cards.cardEditor;
  readonly dataError = this.store.error;
  readonly syncStatus = syncStatus;
  readonly updateReady = signal(false);

  private initialized = false;

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.destroyRef.onDestroy(
      startSyncLifecycle(() => this.store.restoreCache()),
    );
    if (this.updates.isEnabled) {
      this.updates.versionUpdates
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          if (event.type === "VERSION_READY") this.updateReady.set(true);
        });
    }
    this.listen("online", () => void this.repository.initialize());
    this.listen("study-profile-changed", () =>
      this.store.displayName.set(cached("display-name", "")),
    );
    this.listen("study-account-ready", () => this.cards.initialize());
    if (localStorage.getItem("study-open-settings") === "yes") {
      localStorage.removeItem("study-open-settings");
      this.setTab("settings");
    }
    this.store.displayName.set(
      cached(
        "display-name",
        String(accountSession()?.user.user_metadata["display_name"] || ""),
      ),
    );
    void this.repository.initialize();
    this.cards.initialize();
    this.reminders.start(() => this.setTab("home"));
  }

  private listen(name: string, handler: EventListener) {
    window.addEventListener(name, handler);
    this.destroyRef.onDestroy(() => window.removeEventListener(name, handler));
  }

  reloadApp() {
    window.location.reload();
  }

  setTab(tab: AppTab) {
    this.navigation.setTab(tab);
    if (tab === "home") this.home.deckPicker.set(false);
    if (tab === "history") this.history.prepareForOpen();
  }
}
