import { publish } from "../platform/events";
import { inject, Injectable, signal } from "@angular/core";
import { accountSession } from "../account";
import { StudyRepository } from "../data/study-repository";
import { StudyStore } from "../data/study-store";
import { createCard } from "../flashcard";
import { I18nService } from "../i18n.service";
import { Card, Priority, StudyItem } from "../models";
import { browserPlatform } from "../platform/browser-platform";
import { studyDate } from "../study-clock";
import { OnboardingState } from "./onboarding-state";
@Injectable()
export class EditorFacade {
  private repository = inject(StudyRepository);
  private store = inject(StudyStore);
  readonly i18n = inject(I18nService);
  private onboarding = inject(OnboardingState);
  readonly studyItems = this.store.queue;
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
  readonly cardEditor = signal(false);
  readonly cardError = signal("");
  readonly savingCard = signal(false);
  cardDraft: Card = this.emptyCard();
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
      publish("study-account-required", { type: "card", card: this.cardDraft });
      return;
    }
    this.savingCard.set(true);
    try {
      await this.repository.saveCard(this.cardDraft);
      this.onboarding.dismiss();
      this.cardEditor.set(false);
    } catch {
      this.cardError.set(this.i18n.t("error.save"));
    } finally {
      this.savingCard.set(false);
    }
  }
  resumePendingSave() {
    try {
      const raw: unknown = JSON.parse(
        browserPlatform.sessionStorage.getItem("study-pending-action") ||
          "null",
      );
      if (!raw || typeof raw !== "object" || !("card" in raw)) return;
      const card = raw.card as Card;
      createCard(card);
      browserPlatform.sessionStorage.removeItem("study-pending-action");
      this.cardDraft = { ...card };
      this.cardEditor.set(true);
      if (accountSession()) void this.saveCard();
    } catch {
      browserPlatform.sessionStorage.removeItem("study-pending-action");
    }
  }
}
