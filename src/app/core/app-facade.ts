import {
  Injectable,
  signal,
  computed,
  inject,
  DestroyRef,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SwUpdate } from "@angular/service-worker";
import { StudyStore } from "./data/study-store";
import { StudyRepository } from "./data/study-repository";
import { ReviewStore } from "./data/review-store";
import { CalendarStore } from "./data/calendar-store";
import { SubjectNavigation } from "./data/subject-navigation";
import { ReminderService } from "./data/reminder-service";
import { Card, StudyItem, Priority, Rating } from "@shared/models";
import { accountSession } from "./account";
import { cached, cache, syncStatus, startSyncLifecycle } from "./sync";
import {
  countDueCards,
  countSubjectCards,
  createCard,
} from "./domain/cards/flashcard";
import {
  nextStudyItem,
  pendingStudyItems,
  sortStudyItems,
} from "./domain/study-plan/study-plan";
import { onboardingStepFor } from "./domain/onboarding/onboarding";
import { createBackup, parseBackup } from "./backup";
import { studyDate } from "./domain/time/study-clock";
import { I18nService } from "./i18n.service";
export type AppTab = "home" | "studyPlan" | "progress" | "history" | "settings";
@Injectable()
export class AppFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private review = inject(ReviewStore);
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
  readonly subject = this.review.subject;
  readonly topic = this.review.topic;
  readonly flipped = this.review.flipped;
  readonly explanationOpen = this.review.explanationOpen;
  readonly sessionLimit = this.review.sessionLimit;
  readonly sessionIds = this.review.sessionIds;
  readonly sessionPosition = this.review.sessionPosition;
  readonly practice = this.review.practice;
  readonly subjectCards = this.review.subjectCards;
  readonly topics = this.review.topics;
  readonly dueCards = this.review.dueCards;
  readonly totalDue = this.review.totalDue;
  readonly card = this.review.card;
  readonly progress = this.review.progress;
  readonly historyMonth = this.calendar.month;
  readonly selectedHistoryDate = this.calendar.selectedDate;
  readonly monthLabel = this.calendar.monthLabel;
  readonly calendarDays = this.calendar.days;
  readonly selectedHistoryDay = this.calendar.selectedDay;
  readonly studyDaysInMonth = this.calendar.count;
  readonly streak = this.calendar.streak;
  readonly activeTab = signal<AppTab>("home");
  readonly deckPicker = signal(false);
  readonly updateReady = signal(false);
  readonly syncStatus = syncStatus;
  readonly studyFormOpen = signal(false);
  readonly studyTitle = signal("");
  readonly studySubject = signal("");
  readonly studyNotes = signal("");
  readonly studyLink = signal("");
  readonly studyPriority = signal<Priority>("media");
  readonly editingStudyId = signal<string | null>(null);
  readonly subjectFormOpen = signal(false);
  readonly newSubjectName = signal("");
  readonly studyError = signal("");
  readonly studySaving = signal(false);
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
  readonly onboardingDismissed = signal(cached("onboarding-dismissed", false));
  readonly legacyAvailable = signal(
    !!localStorage.getItem("flashcards") ||
      !!localStorage.getItem("study-queue"),
  );
  readonly cardEditor = signal(false);
  readonly cardError = signal("");
  readonly backupMessage = signal("");
  readonly savingCard = signal(false);
  cardDraft: Card = this.emptyCard();
  private initialized = false;
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
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
    this.listen("study-profile-changed", () =>
      this.displayName.set(cached("display-name", "")),
    );
    this.listen("study-account-ready", () => this.resumePendingSave());
    if (localStorage.getItem("study-open-settings") === "yes") {
      localStorage.removeItem("study-open-settings");
      this.setTab("settings");
    }
    this.displayName.set(
      cached(
        "display-name",
        String(accountSession()?.user.user_metadata["display_name"] || ""),
      ),
    );
    void this.repository.initialize();
    this.resumePendingSave();
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
  openStudyForm() {
    this.editingStudyId.set(null);
    this.studyFormOpen.set(true);
    this.studyTitle.set("");
    this.studySubject.set("");
    this.studyNotes.set("");
    this.studyLink.set("");
    this.studyPriority.set("media");
  }
  openTopicForm(name: string) {
    this.openStudyForm();
    this.studySubject.set(name);
  }
  editStudyItem(item: StudyItem) {
    this.editingStudyId.set(item.id);
    this.studyTitle.set(item.title);
    this.studySubject.set(item.subject);
    this.studyNotes.set(item.notes);
    this.studyLink.set(item.link || "");
    this.studyPriority.set(item.priority);
    this.studyFormOpen.set(true);
  }
  closeStudyForm() {
    this.studyFormOpen.set(false);
    this.editingStudyId.set(null);
  }
  async saveStudyItem() {
    const title = this.studyTitle().trim();
    if (!title || this.studySaving()) return;
    this.studySaving.set(true);
    this.studyError.set("");
    try {
      const id = this.editingStudyId();
      const old = this.studyItems().find((t) => t.id === id);
      await this.repository.saveTopic({
        id: id || crypto.randomUUID(),
        title,
        subject: this.studySubject(),
        notes: this.studyNotes().trim(),
        link: this.studyLink() || null,
        priority: this.studyPriority(),
        status: old?.status || "todo",
        completed_at: old?.completed_at || null,
        created_at: old?.created_at || new Date().toISOString(),
      });
      this.closeStudyForm();
    } catch {
      this.studyError.set(this.i18n.t("error.topicSave"));
    } finally {
      this.studySaving.set(false);
    }
  }
  async addStudySubject() {
    const name = this.newSubjectName().trim();
    if (!name) return;
    try {
      await this.repository.saveSubject({
        id: crypto.randomUUID(),
        name,
        days: [],
        archived: false,
        deck_key: name,
      });
      this.studySubject.set(name);
      this.newSubjectName.set("");
      this.subjectFormOpen.set(false);
    } catch (error) {
      this.studyError.set(
        error instanceof Error ? error.message : this.i18n.t("error.save"),
      );
    }
  }
  async completeStudyItem(item: StudyItem) {
    try {
      await this.repository.completeTopic(item);
    } catch {
      this.studyError.set(this.i18n.t("error.save"));
    }
  }
  subjectLabel() {
    const key = this.subject();
    return (
      this.subjectConfigs().find((s) => (s.deck_key || s.name) === key)?.name ||
      key ||
      ""
    );
  }
  reviewLabel() {
    return this.topic() === "Todos"
      ? this.subjectLabel()
      : `${this.subjectLabel()} — ${this.topic()}`;
  }
  subjectDue = (name: string) => countDueCards(this.cards(), name, studyDate());
  subjectTotal = (name: string) => countSubjectCards(this.cards(), name);
  nextTopic(name: string) {
    return nextStudyItem(this.studyItems(), name);
  }
  pendingTopics(name: string) {
    return pendingStudyItems(this.studyItems(), name).length;
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
  openDeck(name: string) {
    if (this.subjectDue(name)) this.openSubject(name);
    else this.openPractice(name);
  }
  openSubject(name: string) {
    this.subject.set(name);
    this.topic.set("Todos");
    this.practice.set(false);
    this.startSession();
  }
  openPractice(name: string) {
    this.openSubject(name);
    this.practice.set(true);
    this.startSession();
  }
  back() {
    this.subject.set(null);
    this.topic.set("Todos");
    this.review.reset();
    this.setTab("home");
  }
  choose(value: string) {
    this.topic.set(value);
    this.startSession();
  }
  reveal() {
    this.flipped.update((v) => !v);
    this.explanationOpen.set(false);
  }
  toggleExplanation() {
    this.explanationOpen.update((v) => !v);
  }
  setSessionLimit(value: number) {
    this.sessionLimit.set(value);
    cache("review-session-limit", value);
    if (this.subject()) this.startSession();
  }
  startSession() {
    this.review.start();
  }
  nextInterval(r: Rating) {
    return this.review.nextInterval(r);
  }
  readonly rating = signal(false);
  async rate(r: Rating) {
    const card = this.card();
    if (!card || this.rating()) return;
    this.rating.set(true);
    try {
      if (!this.practice()) {
        const days = this.nextInterval(r);
        const date = new Date(studyDate() + "T12:00:00Z");
        date.setUTCDate(date.getUTCDate() + days);
        await this.repository.rateCard(
          { ...card, due: date.toISOString().slice(0, 10), interval: days },
          this.reviewLabel(),
          r,
        );
      }
      this.sessionPosition.update((v) => v + 1);
      this.review.reset();
    } catch {
      this.store.error.set(this.i18n.t("error.save"));
    } finally {
      this.rating.set(false);
    }
  }
  onboardingStep() {
    return onboardingStepFor(
      this.onboardingDismissed(),
      this.activeSubjects(),
      this.studyItems(),
      this.cards(),
    );
  }
  dismissOnboarding() {
    cache("onboarding-dismissed", true);
    this.onboardingDismissed.set(true);
  }
  startFirstSubject() {
    this.setTab("studyPlan");
    this.navigation.run((m) => m.openNew());
  }
  startFirstTopic() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.setTab("studyPlan");
    this.navigation.run((m) => {
      m.openSubject(first);
      m.detailTab.set("topics");
      this.openTopicForm(first.name);
    });
  }
  startFirstRoutine() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.setTab("studyPlan");
    this.navigation.run((m) => m.edit(first));
  }
  startFirstCard() {
    const first = this.activeSubjects()[0];
    if (!first) return this.startFirstSubject();
    this.dismissOnboarding();
    this.setTab("studyPlan");
    this.openCardEditor(first.deck_key || first.name);
  }
  private emptyCard(subject = ""): Card {
    return {
      id: 0,
      subject,
      topic: "",
      question: "",
      answer: "",
      explanation: "",
      example: "",
      due: studyDate(),
      interval: 0,
    };
  }
  openCardEditor(subject: string, card?: Card) {
    this.cardDraft = card ? { ...card } : this.emptyCard(subject);
    this.cardError.set("");
    this.cardEditor.set(true);
  }
  async saveCard() {
    if (this.savingCard()) return;
    try {
      createCard(this.cardDraft);
    } catch {
      this.cardError.set(this.i18n.t("error.cardRequired"));
      return;
    }
    if (!accountSession()) {
      window.dispatchEvent(
        new CustomEvent("study-account-required", {
          detail: { type: "card", card: this.cardDraft },
        }),
      );
      return;
    }
    this.savingCard.set(true);
    try {
      await this.repository.saveCard(this.cardDraft);
      this.dismissOnboarding();
      this.cardEditor.set(false);
    } catch {
      this.cardError.set(this.i18n.t("error.save"));
    } finally {
      this.savingCard.set(false);
    }
  }
  private resumePendingSave() {
    try {
      const raw: unknown = JSON.parse(
        sessionStorage.getItem("study-pending-action") || "null",
      );
      if (!raw || typeof raw !== "object" || !("card" in raw)) return;
      const card = raw.card as Card;
      createCard(card);
      sessionStorage.removeItem("study-pending-action");
      this.cardDraft = { ...card };
      this.cardEditor.set(true);
      if (accountSession()) void this.saveCard();
    } catch {
      sessionStorage.removeItem("study-pending-action");
    }
  }
  async importBackup(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error();
      await this.repository.importBackup(parseBackup(await file.text()));
      this.backupMessage.set(this.i18n.t("backup.success"));
    } catch (error) {
      this.backupMessage.set(
        error instanceof Error && error.message.startsWith("Este backup antigo")
          ? error.message
          : this.i18n.t("backup.invalid"),
      );
    } finally {
      input.value = "";
    }
  }
  exportBackup(event: MouseEvent) {
    const data = createBackup(
      this.cards(),
      this.subjectConfigs(),
      this.studyItems(),
      this.history(),
    );
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = event.currentTarget as HTMLAnchorElement;
    a.href = url;
    a.download = "meus-estudos-" + studyDate() + ".json";
    const timer = window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    this.destroyRef.onDestroy(() => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
    });
  }
  async recoverLegacy() {
    try {
      const cards: Card[] = JSON.parse(
        localStorage.getItem("flashcards") || "[]",
      );
      const data = {
        version: 2,
        cards,
        subjects: JSON.parse(
          localStorage.getItem("study-subject-config") || "[]",
        ),
        topics: JSON.parse(localStorage.getItem("study-queue") || "[]"),
        progress: cards.map((c) => ({
          id: c.id,
          due: c.due,
          interval: c.interval,
        })),
        history: JSON.parse(localStorage.getItem("study-history") || "[]"),
      };
      await this.repository.importBackup(parseBackup(JSON.stringify(data)));
      this.backupMessage.set(this.i18n.t("backup.success"));
    } catch {
      this.backupMessage.set(this.i18n.t("backup.invalid"));
    }
  }
}
