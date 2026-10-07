import { inject, Injectable, signal } from "@angular/core";
import { createBackup, parseBackup } from "../backup";
import { StudyRepository } from "../data/study-repository";
import { StudyStore } from "../data/study-store";
import { I18nService } from "../i18n.service";
import { Card } from "../models";
import { browserPlatform } from "../platform/browser-platform";
import { studyDate } from "../study-clock";
@Injectable()
export class BackupFacade {
  private repository = inject(StudyRepository);
  private store = inject(StudyStore);
  readonly i18n = inject(I18nService);
  readonly cards = this.store.cards;
  readonly subjectConfigs = this.store.subjects;
  readonly studyItems = this.store.queue;
  readonly history = this.store.history;
  readonly legacyAvailable = signal(
    !!browserPlatform.storage.getItem("flashcards") ||
      !!browserPlatform.storage.getItem("study-queue"),
  );
  readonly backupMessage = signal("");
  async importBackup(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await this.repository.importBackup(
        parseBackup(await browserPlatform.readText(file, 2_000_000)),
      );
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
    event.preventDefault();
    const data = createBackup(
      this.cards(),
      this.subjectConfigs(),
      this.studyItems(),
      this.history(),
    );
    browserPlatform.saveText(
      "meus-estudos-" + studyDate() + ".json",
      JSON.stringify(data, null, 2),
      "application/json",
    );
  }
  async recoverLegacy() {
    try {
      const cards: Card[] = JSON.parse(
        browserPlatform.storage.getItem("flashcards") || "[]",
      );
      const data = {
        version: 2,
        cards,
        subjects: JSON.parse(
          browserPlatform.storage.getItem("study-subject-config") || "[]",
        ),
        topics: JSON.parse(
          browserPlatform.storage.getItem("study-queue") || "[]",
        ),
        progress: cards.map((c) => ({
          id: c.id,
          due: c.due,
          interval: c.interval,
        })),
        history: JSON.parse(
          browserPlatform.storage.getItem("study-history") || "[]",
        ),
      };
      await this.repository.importBackup(parseBackup(JSON.stringify(data)));
      this.backupMessage.set(this.i18n.t("backup.success"));
    } catch {
      this.backupMessage.set(this.i18n.t("backup.invalid"));
    }
  }
}
