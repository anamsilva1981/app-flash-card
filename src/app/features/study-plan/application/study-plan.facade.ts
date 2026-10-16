import { Injectable, computed, inject, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { StudyPlanRepository } from "../../../core/application/feature-repositories";
import { I18nService } from "../../../core/i18n/i18n.service";
import { Card, Priority, StudyItem } from "../../../shared/models";
import { sortStudyItems } from "../../../shared/domain/study-plan";
import { CardsFacade } from "../../cards/public-api";
import { ReviewFacade } from "../../review/public-api";
import {
  parseAiCards,
  AiCardDraft,
} from "../../../shared/domain/ai-card-import";
import { studyDate } from "../../../shared/utils/study-clock";

@Injectable()
export class StudyPlanFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyPlanRepository);
  private i18n = inject(I18nService);
  private cardsFacade = inject(CardsFacade);
  private reviewFacade = inject(ReviewFacade);

  readonly cards = this.store.cards;
  readonly studyItems = this.store.queue;
  readonly activeSubjects = this.store.activeSubjects;
  readonly cardEditor = this.cardsFacade.cardEditor;
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
  readonly aiImportOpen = signal(false);
  readonly aiJson = signal("");
  readonly aiPreview = signal<AiCardDraft[]>([]);
  readonly aiError = signal("");
  readonly aiImporting = signal(false);
  readonly aiImportedCount = signal(0);
  readonly aiDeckName = signal("");
  readonly aiSubject = signal("");
  readonly studySubjects = computed(() =>
    this.activeSubjects().map((subject) => subject.name),
  );
  readonly todoStudyItems = computed(() =>
    sortStudyItems(this.studyItems().filter((item) => item.status === "todo")),
  );
  readonly completedStudyItems = computed(() =>
    sortStudyItems(
      this.studyItems().filter((item) => item.status === "done"),
      true,
    ),
  );

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

  openAiImport() {
    this.aiImportOpen.set(true);
    this.aiError.set("");
    this.aiPreview.set([]);
    this.aiImportedCount.set(0);
    this.aiSubject.set(
      this.activeSubjects()[0]?.deck_key ||
        this.activeSubjects()[0]?.name ||
        "",
    );
    this.aiDeckName.set("");
  }

  closeAiImport() {
    this.aiImportOpen.set(false);
  }

  validateAiImport() {
    try {
      this.aiPreview.set(parseAiCards(this.aiJson()));
      this.aiError.set("");
    } catch (error) {
      this.aiPreview.set([]);
      this.aiError.set(
        error instanceof Error ? error.message : this.i18n.t("error.aiImport"),
      );
    }
  }

  async importAiCards() {
    if (!this.aiPreview().length || this.aiImporting()) return;
    this.aiImporting.set(true);
    this.aiError.set("");
    try {
      let subjectKey = this.aiSubject().trim();
      if (!subjectKey) {
        const name =
          this.aiDeckName().trim() || this.i18n.t("ui.cardsImportadosPorIA");
        const subject = {
          id: crypto.randomUUID(),
          name,
          days: [],
          archived: false,
          deck_key: name,
        };
        await this.repository.saveSubject(subject);
        subjectKey = name;
      }
      const cards: Card[] = this.aiPreview().map((draft, index) => ({
        id: Date.now() + index,
        subject: subjectKey,
        topic: draft.topic,
        question: draft.question,
        answer: draft.answer,
        explanation: draft.explanation,
        example: draft.example,
        due: studyDate(),
        interval: 0,
      }));
      await this.repository.importCards(cards);
      this.aiImportedCount.set(cards.length);
      this.aiPreview.set([]);
      this.aiJson.set("");
    } catch (error) {
      this.aiError.set(
        error instanceof Error ? error.message : this.i18n.t("error.aiImport"),
      );
    } finally {
      this.aiImporting.set(false);
    }
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
      const old = this.studyItems().find((topic) => topic.id === id);
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

  openCardEditor(subject: string, card?: Card) {
    this.cardsFacade.openCardEditor(subject, card);
  }

  openPractice(name: string) {
    this.reviewFacade.openPractice(name);
  }

  openSubject(name: string) {
    this.reviewFacade.openSubject(name);
  }
}
