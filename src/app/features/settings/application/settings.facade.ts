import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { StudyRepository } from "../../../core/application/study-repository";
import { I18nService } from "../../../core/i18n/i18n.service";
import { createBackup, parseBackup } from "../../../core/backup/backup";
import { syncStatus } from "../../../core/persistence/sync";
import { studyDate } from "../../../shared/utils/study-clock";
import { Card } from "../../../shared/models";

@Injectable()
export class SettingsFacade {
  private store = inject(StudyStore);
  private repository = inject(StudyRepository);
  private i18n = inject(I18nService);
  private destroyRef = inject(DestroyRef);

  readonly syncStatus = syncStatus;
  readonly backupMessage = signal("");
  readonly legacyAvailable = signal(
    !!localStorage.getItem("flashcards") ||
      !!localStorage.getItem("study-queue"),
  );

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
      this.store.cards(),
      this.store.subjects(),
      this.store.queue(),
      this.store.history(),
    );
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = event.currentTarget as HTMLAnchorElement;
    anchor.href = url;
    anchor.download = "meus-estudos-" + studyDate() + ".json";
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
        version: 2 as const,
        cards,
        subjects: JSON.parse(
          localStorage.getItem("study-subject-config") || "[]",
        ),
        topics: JSON.parse(localStorage.getItem("study-queue") || "[]"),
        progress: cards.map((card) => ({
          id: card.id,
          due: card.due,
          interval: card.interval,
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
