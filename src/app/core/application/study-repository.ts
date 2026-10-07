import { validateBackup } from "../persistence/validation";
import { I18nService } from "../i18n/i18n.service";
import { Injectable, inject } from "@angular/core";
import { accountScope, accountSession } from "../auth/account";
import {
  cached,
  commitBatch,
  commitTransaction,
  flush,
  hasPending,
  readAccountSnapshot,
  writeRevision,
} from "../persistence/sync";
import { StudyStore } from "../state/study-store";
import {
  normalizeRelations,
  renameSubjectRelations,
  resolveSubject,
} from "../../shared/domain/relations";
import {
  BackupData,
  Card,
  ManagedSubject,
  OperationInput,
  StudyDay,
  StudyItem,
} from "../../shared/models";
import {
  historyFromRemote,
  addStudyActivity,
} from "../../shared/domain/study-history";
import { mergeCardProgress } from "../../shared/domain/progress";
import { upsertCard, createCard } from "../../shared/domain/flashcard";
import { studyDate } from "../../shared/utils/study-clock";
import {
  normalizeStudyLink,
  upsertStudyItem,
} from "../../shared/domain/study-plan";
import { prepareBackup } from "../backup/backup";

@Injectable()
export class StudyRepository {
  readonly store = inject(StudyStore);
  private i18n = inject(I18nService);

  async initialize() {
    const scope = accountScope();
    try {
      if (!accountSession()) return;
      await flush();
      if (scope !== accountScope() || hasPending()) return;
      const revision = writeRevision();
      const remote = await readAccountSnapshot();
      if (
        scope !== accountScope() ||
        revision !== writeRevision() ||
        hasPending()
      )
        return;
      const normalized = normalizeRelations(remote);
      const state = {
        subjects: normalized.subjects,
        cards: mergeCardProgress(normalized.cards, remote.progress),
        queue: normalized.queue,
        history: historyFromRemote(remote.activity),
      };
      const preferences: Record<string, unknown> = {};
      if (remote.preferences.display_name !== undefined)
        preferences["display-name"] = remote.preferences.display_name;
      if (remote.preferences.reminder_time)
        preferences["reminder-time"] = remote.preferences.reminder_time;
      if (remote.preferences.reminder_days)
        preferences["reminder-days"] = remote.preferences.reminder_days;
      await commitBatch(
        { ...this.patch(state), ...preferences },
        [],
        scope,
        revision,
      );
      if (scope !== accountScope()) return;
      this.store.apply(state);
      this.store.displayName.set(
        cached(
          "display-name",
          accountSession()?.user.user_metadata["display_name"] || "",
        ),
      );
      this.store.error.set("");
    } catch {
      if (scope === accountScope())
        this.store.error.set(this.i18n.t("error.sync"));
    }
  }

  private patch(state: ReturnType<StudyStore["snapshot"]>) {
    return {
      flashcards: state.cards,
      "study-subject-config": state.subjects,
      "study-queue": state.queue,
      "study-history": state.history,
    };
  }

  private async mutate(
    build: (state: ReturnType<StudyStore["snapshot"]>) => {
      state: ReturnType<StudyStore["snapshot"]>;
      operations: OperationInput[];
    },
  ) {
    const scope = accountScope();
    let next: ReturnType<StudyStore["snapshot"]> | undefined;
    await commitTransaction((read) => {
      const current = {
        cards: read<Card[]>("flashcards", []),
        subjects: read<ManagedSubject[]>("study-subject-config", []),
        queue: read<StudyItem[]>("study-queue", []),
        history: read<StudyDay[]>("study-history", []),
      };
      const result = build(current);
      next = result.state;
      return { patch: this.patch(result.state), operations: result.operations };
    }, scope);
    if (scope === accountScope() && next) this.store.apply(next);
  }

  async saveCard(draft: Card) {
    const card = createCard(draft);
    await this.mutate((current) => {
      const state = normalizeRelations({
        ...current,
        cards: upsertCard(current.cards, {
          ...card,
          subject_id: resolveSubject(current.subjects, card.subject)?.id,
          topic_id: undefined,
        }),
      });
      return {
        state,
        operations: [
          {
            path: "account_cards",
            body: state.cards.find(
              (currentCard) => currentCard.id === card.id,
            )!,
          },
        ],
      };
    });
  }

  async saveTopic(item: StudyItem) {
    await this.mutate((current) => {
      const state = normalizeRelations({
        ...current,
        queue: upsertStudyItem(
          current.queue,
          { ...item, link: item.link ? normalizeStudyLink(item.link) : null },
          current.queue.some((topic) => topic.id === item.id) ? item.id : null,
        ),
      });
      return {
        state,
        operations: [
          {
            path: "study_queue",
            body: state.queue.find((topic) => topic.id === item.id)!,
          },
        ],
      };
    });
  }

  async saveSubject(item: ManagedSubject, previous?: ManagedSubject) {
    await this.mutate((current) => {
      if (
        current.subjects.some(
          (subject) =>
            subject.id !== item.id &&
            subject.name.toLowerCase() === item.name.toLowerCase(),
        )
      )
        throw new Error(this.i18n.t("error.duplicateSubject"));
      const old = current.subjects.find((subject) => subject.id === item.id);
      const subjects = old
        ? current.subjects.map((subject) =>
            subject.id === item.id ? item : subject,
          )
        : [...current.subjects, item];
      const relations = old
        ? renameSubjectRelations(current.cards, current.queue, item, old.name)
        : { cards: current.cards, queue: current.queue };
      const state = normalizeRelations({ ...current, subjects, ...relations });
      const operation: OperationInput =
        previous || old
          ? {
              path: "rpc/rename_study_subject",
              body: {
                subject_id: item.id,
                new_name: item.name,
                routine: item.days,
                is_archived: item.archived,
              },
            }
          : { path: "study_subjects", body: item };
      return { state, operations: [operation] };
    });
  }

  async completeTopic(item: StudyItem) {
    await this.mutate((current) => {
      const existing = current.queue.find((topic) => topic.id === item.id);
      if (!existing) throw new Error("Topic not found");
      if (existing.status === "done") return { state: current, operations: [] };
      const at = new Date().toISOString();
      const date = studyDate();
      const state = {
        ...current,
        queue: current.queue.map((topic) =>
          topic.id === item.id
            ? { ...topic, status: "done" as const, completed_at: at }
            : topic,
        ),
        history: addStudyActivity(
          current.history,
          date,
          (existing.subject ? existing.subject + " — " : "") + existing.title,
          "learning",
        ),
      };
      return {
        state,
        operations: [
          {
            path: "rpc/complete_study_topic",
            body: { topic_id: item.id, finished_at: at, study_date: date },
          },
        ],
      };
    });
  }

  async rateCard(card: Card, label: string, rating: string) {
    await this.mutate((current) => {
      const state = {
        ...current,
        cards: upsertCard(current.cards, {
          ...card,
          subject_id: resolveSubject(current.subjects, card.subject)?.id,
          topic_id: undefined,
        }),
        history: addStudyActivity(
          current.history,
          studyDate(),
          label,
          "review",
        ),
      };
      return {
        state,
        operations: [
          {
            path: "seed_card_progress",
            body: {
              card_id: card.id,
              due: card.due,
              interval: card.interval,
              rating,
              last_reviewed_at: new Date().toISOString(),
            },
          },
          {
            path: "study_activity",
            body: { activity_date: studyDate(), kind: "review", label },
          },
        ],
      };
    });
  }

  async importBackup(data: BackupData) {
    data = validateBackup(data);
    await this.mutate((current) => {
      const prepared = prepareBackup(current, data);
      const operations = prepared.operations.map((operation) => ({
        ...operation,
        id: crypto.randomUUID(),
      }));
      if (
        operations.length > 10000 ||
        new TextEncoder().encode(JSON.stringify(operations)).byteLength >
          2_000_000
      ) {
        throw new Error("Backup exceeds the atomic batch limit");
      }
      return {
        state: prepared.state,
        operations: operations.length
          ? [{ path: "rpc/apply_account_batch", body: operations }]
          : [],
      };
    });
  }
}
