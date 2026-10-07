import { normalizeRelations } from "./relations";
import { validateBackup } from "./validation";
import {
  BackupData,
  Card,
  ManagedSubject,
  OperationInput,
  StudyDay,
  StudyItem,
} from "./models";
import { normalizeStudyLink } from "./study-plan";
export function createBackup(
  cards: Card[],
  subjects: ManagedSubject[],
  topics: StudyItem[],
  history: StudyDay[],
) {
  return {
    version: 2,
    cards,
    exported_at: new Date().toISOString(),
    subjects,
    topics,
    progress: cards.map((c) => ({
      id: c.id,
      due: c.due,
      interval: c.interval,
    })),
    history,
  };
}
export function parseBackup(content: string): BackupData {
  return validateBackup(JSON.parse(content));
}
export function mergeBackupCards(current: Card[], incoming: Card[]) {
  const added = incoming.filter(
    (card) => !current.some((existing) => existing.id === card.id),
  );
  return { cards: [...current, ...added], added };
}
export function mergeBackupSubjects(
  current: ManagedSubject[],
  incoming: ManagedSubject[],
) {
  const added = incoming
    .filter(
      (raw) =>
        !current.some(
          (s) =>
            s.id === raw.id || s.name.toLowerCase() === raw.name.toLowerCase(),
        ),
    )
    .map((raw) => ({
      ...raw,
      name: raw.name.trim(),
      deck_key: raw.deck_key || raw.name,
    }));
  return { subjects: [...current, ...added], added };
}
export function mergeBackupHistory(
  current: StudyDay[],
  incoming: StudyDay[],
): StudyDay[] {
  const merged = structuredClone(current);
  for (const day of incoming) {
    let target = merged.find((existing) => existing.date === day.date);
    if (!target) {
      target = { date: day.date, learning: [], reviews: [] };
      merged.push(target);
    }
    target.learning = Array.from(
      new Set([...target.learning, ...day.learning]),
    );
    target.reviews = Array.from(new Set([...target.reviews, ...day.reviews]));
  }
  return merged.sort((a, b) => b.date.localeCompare(a.date));
}
export interface BackupState {
  cards: Card[];
  subjects: ManagedSubject[];
  queue: StudyItem[];
  history: StudyDay[];
}
/** Validate and prepare everything before any cache, queue or signal is touched. */
export function prepareBackup(
  current: BackupState,
  data: BackupData,
): { state: BackupState; operations: OperationInput[] } {
  const subjectMerge = mergeBackupSubjects(current.subjects, data.subjects);
  const subjectIds = new Map(
    data.subjects.map((s) => [
      s.id,
      subjectMerge.subjects.find(
        (x) => x.id === s.id || x.name.toLowerCase() === s.name.toLowerCase(),
      )!.id,
    ]),
  );
  const incomingCards = data.cards.map((c) => ({
    ...c,
    ...(c.subject_id
      ? { subject_id: subjectIds.get(c.subject_id) || c.subject_id }
      : {}),
  }));
  const mergedCards = mergeBackupCards(current.cards, incomingCards);
  const addedTopics = data.topics
    .filter((t) => !current.queue.some((x) => x.id === t.id))
    .map((t) => ({
      ...t,
      subject_id: t.subject_id
        ? subjectIds.get(t.subject_id) || t.subject_id
        : null,
      link: t.link ? normalizeStudyLink(t.link) : null,
    }));
  const normalized = normalizeRelations({
    subjects: subjectMerge.subjects,
    cards: mergedCards.cards,
    queue: [...current.queue, ...addedTopics],
  });
  const cards = normalized.cards.map((c) => {
    const p = data.progress.find((x) => x.id === c.id);
    return p && c.interval === 0
      ? { ...c, due: p.due, interval: p.interval }
      : c;
  });
  const state = {
    ...normalized,
    cards,
    history: mergeBackupHistory(current.history, data.history),
  };
  const operations: OperationInput[] = [
    ...subjectMerge.added.map((body) => ({ path: "study_subjects", body })),
    ...addedTopics.map((t) => ({
      path: "study_queue",
      body: state.queue.find((x) => x.id === t.id)!,
    })),
    ...mergedCards.added.map((c) => ({
      path: "account_cards",
      body: state.cards.find((x) => x.id === c.id)!,
    })),
  ];
  for (const card of state.cards) {
    const old = current.cards.find((c) => c.id === card.id);
    if (card.interval !== old?.interval || card.due !== old?.due)
      operations.push({
        path: "seed_card_progress",
        body: { card_id: card.id, due: card.due, interval: card.interval },
      });
  }
  for (const day of data.history)
    for (const kind of ["learning", "review"] as const)
      for (const label of kind === "learning" ? day.learning : day.reviews)
        operations.push({
          path: "study_activity",
          body: { activity_date: day.date, kind, label },
        });
  return { state, operations };
}
