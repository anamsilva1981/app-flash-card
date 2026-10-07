import { subscribe } from "./platform/events";
import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SwUpdate } from "@angular/service-worker";
import { accountSession } from "./account";
import { BackupFacade } from "./application/backup-facade";
import { EditorFacade } from "./application/editor-facade";
import { NavigationState } from "./application/navigation-state";
import { OnboardingFacade } from "./application/onboarding-facade";
import { ReviewFacade } from "./application/review-facade";
import { CalendarStore } from "./data/calendar-store";
import { ReminderService } from "./data/reminder-service";
import { StudyRepository } from "./data/study-repository";
import { StudyStore } from "./data/study-store";
import { SubjectNavigation } from "./data/subject-navigation";
import { I18nService } from "./i18n.service";
import { Card } from "./models";
import { browserPlatform } from "./platform/browser-platform";
import { StudyClock } from "./platform/study-clock-service";
import { sortStudyItems } from "./study-plan";
import { cached, startSyncLifecycle, syncStatus } from "./sync";
export type AppTab = "home" | "studyPlan" | "progress" | "history" | "settings";
@Injectable()
export class AppFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private calendar = inject(CalendarStore);
  private navigation = inject(SubjectNavigation);
  private reminders = inject(ReminderService);
  private updates = inject(SwUpdate);
  private destroyRef = inject(DestroyRef);
  readonly i18n = inject(I18nService);
  readonly cards = this.store.cards;
  readonly studyItems = this.store.queue;
  readonly history = this.store.history;
  readonly subjectConfigs = this.store.subjects;
  readonly displayName = this.store.displayName;
  readonly activeSubjects = this.store.activeSubjects;
  readonly todaysSubjects = this.store.todaysSubjects;
  readonly dataError = this.store.error;
  readonly historyMonth = this.calendar.month;
  readonly selectedHistoryDate = this.calendar.selectedDate;
  readonly monthLabel = this.calendar.monthLabel;
  readonly calendarDays = this.calendar.days;
  readonly selectedHistoryDay = this.calendar.selectedDay;
  readonly studyDaysInMonth = this.calendar.count;
  readonly streak = this.calendar.streak;
  private shell = inject(NavigationState);
  readonly activeTab = this.shell.activeTab;
  readonly deckPicker = signal(false);
  readonly updateReady = signal(false);
  readonly syncStatus = syncStatus;
  readonly studySubjects = computed(() =>
    this.activeSubjects().map((s) => s.name),
  );
  readonly todoStudyItems = computed(() =>
    sortStudyItems(this.studyItems().filter((x) => x.status === "todo")),
  );
  readonly completedStudyItems = computed(() =>
    sortStudyItems(
      this.studyItems().filter((x) => x.status === "done"),
      true,
    ),
  );
  private editors = inject(EditorFacade);
  private backup = inject(BackupFacade);
  private reviews = inject(ReviewFacade);
  private onboarding = inject(OnboardingFacade);
  private clock = inject(StudyClock);
  private initialized = false;
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.clock.start(this.destroyRef);
    this.destroyRef.onDestroy(
      startSyncLifecycle(() => this.store.restoreCache()),
    );
    if (this.updates.isEnabled)
      this.updates.versionUpdates
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          if (e.type === "VERSION_READY") this.updateReady.set(true);
        });
    this.listen("online", () => void this.repository.initialize());
    this.destroyRef.onDestroy(
      subscribe("study-profile-changed", () =>
        this.displayName.set(cached("display-name", "")),
      ),
    );
    this.destroyRef.onDestroy(
      subscribe("study-account-ready", () => this.editors.resumePendingSave()),
    );
    if (browserPlatform.storage.getItem("study-open-settings") === "yes") {
      browserPlatform.storage.removeItem("study-open-settings");
      this.setTab("settings");
    }
    this.displayName.set(
      cached(
        "display-name",
        String(accountSession()?.user.user_metadata["display_name"] || ""),
      ),
    );
    void this.repository.initialize();
    this.editors.resumePendingSave();
    this.reminders.start(() => this.setTab("home"));
  }
  private listen(name: string, handler: EventListener) {
    browserPlatform.events.addEventListener(name, handler);
    this.destroyRef.onDestroy(() =>
      browserPlatform.events.removeEventListener(name, handler),
    );
  }
  reloadApp() {
    browserPlatform.events.location.reload();
  }
  setTab(tab: AppTab) {
    this.activeTab.set(tab);
    if (tab === "home") this.deckPicker.set(false);
    if (tab === "history" && !this.selectedHistoryDate()) {
      const latest = this.history().find(
        (d) => d.learning.length || d.reviews.length,
      );
      if (latest) {
        const d = new Date(latest.date + "T12:00:00");
        this.historyMonth.set(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }
  goToSubject(name: string) {
    this.setTab("studyPlan");
    this.navigation.run((m) => {
      const s = m.subjects().find((x) => x.name === name);
      if (s) {
        m.openSubject(s);
        m.detailTab.set("topics");
      }
    });
  }
  changeHistoryMonth(offset: number) {
    this.calendar.change(offset);
  }
  selectHistoryDate(date: string | null) {
    if (date) this.selectedHistoryDate.set(date);
  }
  formatDate(date: string) {
    return new Date(date + "T12:00:00").toLocaleDateString(
      this.i18n.language(),
    );
  }
  readonly studyFormOpen = this.editors.studyFormOpen;
  readonly studyTitle = this.editors.studyTitle;
  readonly studySubject = this.editors.studySubject;
  readonly studyNotes = this.editors.studyNotes;
  readonly studyLink = this.editors.studyLink;
  readonly studyPriority = this.editors.studyPriority;
  readonly editingStudyId = this.editors.editingStudyId;
  readonly subjectFormOpen = this.editors.subjectFormOpen;
  readonly newSubjectName = this.editors.newSubjectName;
  readonly studyError = this.editors.studyError;
  readonly studySaving = this.editors.studySaving;
  readonly cardEditor = this.editors.cardEditor;
  readonly cardError = this.editors.cardError;
  readonly savingCard = this.editors.savingCard;
  openStudyForm(...args: Parameters<EditorFacade["openStudyForm"]>) {
    return this.editors.openStudyForm(...args);
  }
  openTopicForm(...args: Parameters<EditorFacade["openTopicForm"]>) {
    return this.editors.openTopicForm(...args);
  }
  editStudyItem(...args: Parameters<EditorFacade["editStudyItem"]>) {
    return this.editors.editStudyItem(...args);
  }
  closeStudyForm(...args: Parameters<EditorFacade["closeStudyForm"]>) {
    return this.editors.closeStudyForm(...args);
  }
  saveStudyItem(...args: Parameters<EditorFacade["saveStudyItem"]>) {
    return this.editors.saveStudyItem(...args);
  }
  addStudySubject(...args: Parameters<EditorFacade["addStudySubject"]>) {
    return this.editors.addStudySubject(...args);
  }
  completeStudyItem(...args: Parameters<EditorFacade["completeStudyItem"]>) {
    return this.editors.completeStudyItem(...args);
  }
  openCardEditor(...args: Parameters<EditorFacade["openCardEditor"]>) {
    return this.editors.openCardEditor(...args);
  }
  saveCard(...args: Parameters<EditorFacade["saveCard"]>) {
    return this.editors.saveCard(...args);
  }
  readonly legacyAvailable = this.backup.legacyAvailable;
  readonly backupMessage = this.backup.backupMessage;
  importBackup(...args: Parameters<BackupFacade["importBackup"]>) {
    return this.backup.importBackup(...args);
  }
  exportBackup(...args: Parameters<BackupFacade["exportBackup"]>) {
    return this.backup.exportBackup(...args);
  }
  recoverLegacy(...args: Parameters<BackupFacade["recoverLegacy"]>) {
    return this.backup.recoverLegacy(...args);
  }
  readonly subject = this.reviews.subject;
  readonly topic = this.reviews.topic;
  readonly flipped = this.reviews.flipped;
  readonly explanationOpen = this.reviews.explanationOpen;
  readonly sessionLimit = this.reviews.sessionLimit;
  readonly sessionIds = this.reviews.sessionIds;
  readonly sessionPosition = this.reviews.sessionPosition;
  readonly practice = this.reviews.practice;
  readonly subjectCards = this.reviews.subjectCards;
  readonly topics = this.reviews.topics;
  readonly dueCards = this.reviews.dueCards;
  readonly totalDue = this.reviews.totalDue;
  readonly card = this.reviews.card;
  readonly progress = this.reviews.progress;
  subjectLabel(...args: Parameters<ReviewFacade["subjectLabel"]>) {
    return this.reviews.subjectLabel(...args);
  }
  topicLabel(id: string) {
    return this.reviews.topicLabel(id);
  }
  reviewLabel(...args: Parameters<ReviewFacade["reviewLabel"]>) {
    return this.reviews.reviewLabel(...args);
  }
  readonly subjectDue = this.reviews.subjectDue;
  readonly subjectTotal = this.reviews.subjectTotal;
  nextTopic(...args: Parameters<ReviewFacade["nextTopic"]>) {
    return this.reviews.nextTopic(...args);
  }
  pendingTopics(...args: Parameters<ReviewFacade["pendingTopics"]>) {
    return this.reviews.pendingTopics(...args);
  }
  openDeck(...args: Parameters<ReviewFacade["openDeck"]>) {
    return this.reviews.openDeck(...args);
  }
  openSubject(...args: Parameters<ReviewFacade["openSubject"]>) {
    return this.reviews.openSubject(...args);
  }
  openPractice(...args: Parameters<ReviewFacade["openPractice"]>) {
    return this.reviews.openPractice(...args);
  }
  back(...args: Parameters<ReviewFacade["back"]>) {
    this.deckPicker.set(false);
    return this.reviews.back(...args);
  }
  choose(...args: Parameters<ReviewFacade["choose"]>) {
    return this.reviews.choose(...args);
  }
  reveal(...args: Parameters<ReviewFacade["reveal"]>) {
    return this.reviews.reveal(...args);
  }
  toggleExplanation(...args: Parameters<ReviewFacade["toggleExplanation"]>) {
    return this.reviews.toggleExplanation(...args);
  }
  setSessionLimit(...args: Parameters<ReviewFacade["setSessionLimit"]>) {
    return this.reviews.setSessionLimit(...args);
  }
  startSession(...args: Parameters<ReviewFacade["startSession"]>) {
    return this.reviews.startSession(...args);
  }
  nextInterval(...args: Parameters<ReviewFacade["nextInterval"]>) {
    return this.reviews.nextInterval(...args);
  }
  readonly rating = this.reviews.rating;
  rate(...args: Parameters<ReviewFacade["rate"]>) {
    return this.reviews.rate(...args);
  }
  readonly onboardingDismissed = this.onboarding.onboardingDismissed;
  onboardingStep(...args: Parameters<OnboardingFacade["onboardingStep"]>) {
    return this.onboarding.onboardingStep(...args);
  }
  dismissOnboarding(
    ...args: Parameters<OnboardingFacade["dismissOnboarding"]>
  ) {
    return this.onboarding.dismissOnboarding(...args);
  }
  startFirstSubject(
    ...args: Parameters<OnboardingFacade["startFirstSubject"]>
  ) {
    return this.onboarding.startFirstSubject(...args);
  }
  startFirstTopic(...args: Parameters<OnboardingFacade["startFirstTopic"]>) {
    return this.onboarding.startFirstTopic(...args);
  }
  startFirstRoutine(
    ...args: Parameters<OnboardingFacade["startFirstRoutine"]>
  ) {
    return this.onboarding.startFirstRoutine(...args);
  }
  startFirstCard(...args: Parameters<OnboardingFacade["startFirstCard"]>) {
    return this.onboarding.startFirstCard(...args);
  }
  get cardDraft() {
    return this.editors.cardDraft;
  }
  set cardDraft(value: Card) {
    this.editors.cardDraft = value;
  }
}
