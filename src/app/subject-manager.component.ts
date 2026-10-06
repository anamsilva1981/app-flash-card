import { A11yModule } from "@angular/cdk/a11y";
import {
  Component,
  signal,
  Input,
  Output,
  EventEmitter,
  inject,
} from "@angular/core";
import { AppIconComponent, SubjectBadgeComponent } from "./app-icon.component";
import { StudyStore } from "./data/study-store";
import { StudyRepository } from "./data/study-repository";
import { ManagedSubject, StudyItem, Card } from "./models";
import { belongsToSubject } from "./data/relations";
import { sortStudyItems } from "./study-plan";
import { studyDate, studyTimeZone } from "./study-clock";
import { I18nService } from "./i18n.service";
import { I18nPipe } from "./i18n.pipe";
export type { ManagedSubject } from "./models";
@Component({
  selector: "app-subject-manager",
  standalone: true,
  imports: [A11yModule, AppIconComponent, SubjectBadgeComponent, I18nPipe],
  templateUrl: "./subject-manager.component.html",
  styleUrl: "./subject-manager.component.css",
})
export class SubjectManagerComponent {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  readonly i18n = inject(I18nService);
  readonly week = [1, 2, 3, 4, 5, 6, 0].map((value) => ({
    value,
    short: "week." + value,
  }));
  readonly subjects = this.store.subjects;
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly name = signal("");
  readonly selectedDays = signal<number[]>([]);
  readonly showArchived = signal(false);
  readonly selectedSubject = signal<ManagedSubject | null>(null);
  readonly detailTab = signal<"flashcards" | "topics">("flashcards");
  readonly selectedTopic = signal<StudyItem | null>(null);
  readonly topicView = signal<"todo" | "done">("todo");
  readonly error = signal("");
  readonly busy = signal(false);
  @Input() flashcards: Card[] = [];
  @Input() studyItems: StudyItem[] = [];
  @Output() addCardRequested = new EventEmitter<string>();
  @Output() editCardRequested = new EventEmitter<Card>();
  @Output() practiceRequested = new EventEmitter<string>();
  @Output() addTopicRequested = new EventEmitter<string>();
  @Output() editTopicRequested = new EventEmitter<StudyItem>();
  @Output() completeTopicRequested = new EventEmitter<StudyItem>();
  @Output() reviewRequested = new EventEmitter<string>();
  visibleSubjects() {
    return this.subjects().filter((s) => s.archived === this.showArchived());
  }
  openSubject(item: ManagedSubject) {
    if (item.archived) return;
    this.selectedSubject.set(item);
    this.detailTab.set("flashcards");
    this.selectedTopic.set(null);
    this.topicView.set("todo");
  }
  closeSubject() {
    this.selectedSubject.set(null);
    this.selectedTopic.set(null);
  }
  subjectCards() {
    const s = this.selectedSubject();
    return s ? this.flashcards.filter((c) => belongsToSubject(c, s)) : [];
  }
  dueCards() {
    return this.subjectCards().filter((c) => c.due <= studyDate());
  }
  subjectTopics() {
    const s = this.selectedSubject();
    return s
      ? sortStudyItems(
          this.studyItems.filter(
            (i) => belongsToSubject(i, s) && i.status === this.topicView(),
          ),
          this.topicView() === "done",
        )
      : [];
  }
  reviewAgain() {
    const s = this.selectedSubject();
    if (s) this.practiceRequested.emit(s.deck_key || s.name);
  }
  reviewDue() {
    const s = this.selectedSubject();
    if (s) this.reviewRequested.emit(s.deck_key || s.name);
  }
  addTopic() {
    const s = this.selectedSubject();
    if (s) this.addTopicRequested.emit(s.name);
  }
  editTopic(item: StudyItem) {
    this.closeTopic();
    this.editTopicRequested.emit(item);
  }
  completeTopic(item: StudyItem) {
    this.closeTopic();
    this.completeTopicRequested.emit(item);
  }
  openTopic(item: StudyItem) {
    this.selectedTopic.set(item);
  }
  closeTopic() {
    this.selectedTopic.set(null);
  }
  openNew() {
    this.editingId.set(null);
    this.name.set("");
    this.selectedDays.set([]);
    this.formOpen.set(true);
  }
  edit(item: ManagedSubject) {
    this.editingId.set(item.id);
    this.name.set(item.name);
    this.selectedDays.set([...item.days]);
    this.formOpen.set(true);
  }
  close() {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.error.set("");
  }
  toggleDay(day: number) {
    this.selectedDays.update((v) =>
      v.includes(day) ? v.filter((d) => d !== day) : [...v, day],
    );
  }
  async save() {
    const name = this.name().trim();
    if (!name || this.busy()) return;
    this.busy.set(true);
    try {
      const old = this.subjects().find((s) => s.id === this.editingId());
      const next: ManagedSubject = {
        id: old?.id || crypto.randomUUID(),
        name,
        days: this.selectedDays(),
        archived: old?.archived || false,
        deck_key: old?.deck_key || old?.name || name,
        routine_initialized: true,
      };
      await this.repository.saveSubject(next, old);
      if (this.selectedSubject()?.id === next.id)
        this.selectedSubject.set(next);
      this.close();
    } catch {
      this.error.set(this.i18n.t("error.subjectSave"));
    } finally {
      this.busy.set(false);
    }
  }
  async archive(item: ManagedSubject) {
    try {
      await this.repository.saveSubject({ ...item, archived: true }, item);
    } catch {
      this.error.set(this.i18n.t("error.save"));
    }
  }
  async restore(item: ManagedSubject) {
    try {
      await this.repository.saveSubject({ ...item, archived: false }, item);
    } catch {
      this.error.set(this.i18n.t("error.save"));
    }
  }
  formatCompleted(value: string | null) {
    return value
      ? new Date(value).toLocaleDateString(this.i18n.language(), {
          timeZone: studyTimeZone(),
        })
      : this.i18n.t("date.missing");
  }
  dayLabel(days: number[]) {
    if (days.length === 7) return this.i18n.t("routine.everyDay");
    if (!days.length) return this.i18n.t("routine.noDays");
    return this.week
      .filter((d) => days.includes(d.value))
      .map((d) => this.i18n.t(d.short))
      .join(", ");
  }
}
