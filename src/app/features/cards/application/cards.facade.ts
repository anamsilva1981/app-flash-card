import { Injectable, inject, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { StudyRepository } from "../../../core/application/study-repository";
import { I18nService } from "../../../core/i18n/i18n.service";
import { accountSession } from "../../../core/auth/account";
import { studyDate } from "../../../shared/utils/study-clock";
import { createCard } from "../../../shared/domain/flashcard";
import { Card } from "../../../shared/models";

@Injectable()
export class CardsFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private i18n = inject(I18nService);

  readonly cardEditor = signal(false);
  readonly language = this.i18n.language;
  readonly cardError = signal("");
  readonly savingCard = signal(false);
  cardDraft: Card = this.emptyCard();

  readonly activeSubjects = this.store.activeSubjects;

  initialize() {
    this.resumePendingSave();
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
}
