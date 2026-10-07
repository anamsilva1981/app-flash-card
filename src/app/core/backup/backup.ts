import {
  BackupData,
  Card,
  ManagedSubject,
  StudyDay,
  StudyItem,
  OperationInput,
} from "../../shared/models";
import { validateBackup } from "../persistence/validation";
import { normalizeRelations } from "../../shared/domain/relations";
import { normalizeStudyLink } from "../../shared/domain/study-plan";

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
    progress: cards.map((card) => ({
      id: card.id,
      due: card.due,
      interval: card.interval,
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
          (subject) =>
            subject.id === raw.id ||
            subject.name.toLowerCase() === raw.name.toLowerCase(),
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
    data.subjects.map((subject) => [
      subject.id,
      subjectMerge.subjects.find(
        (currentSubject) =>
          currentSubject.id === subject.id ||
          currentSubject.name.toLowerCase() === subject.name.toLowerCase(),
      )!.id,
    ]),
  );
  const incomingCards = data.cards.map((card) => ({
    ...card,
    ...(card.subject_id
      ? { subject_id: subjectIds.get(card.subject_id) || card.subject_id }
      : {}),
  }));
  const mergedCards = mergeBackupCards(current.cards, incomingCards);
  const addedTopics = data.topics
    .filter((topic) => !current.queue.some((item) => item.id === topic.id))
    .map((topic) => ({
      ...topic,
      subject_id: topic.subject_id
        ? subjectIds.get(topic.subject_id) || topic.subject_id
        : null,
      link: topic.link ? normalizeStudyLink(topic.link) : null,
    }));
  const normalized = normalizeRelations({
    subjects: subjectMerge.subjects,
    cards: mergedCards.cards,
    queue: [...current.queue, ...addedTopics],
  });
  const cards = normalized.cards.map((card) => {
    const progress = data.progress.find((item) => item.id === card.id);
    return progress && card.interval === 0
      ? { ...card, due: progress.due, interval: progress.interval }
      : card;
  });
  const state = {
    ...normalized,
    cards,
    history: mergeBackupHistory(current.history, data.history),
  };
  const operations: OperationInput[] = [
    ...subjectMerge.added.map((body) => ({ path: "study_subjects", body })),
    ...addedTopics.map((topic) => ({
      path: "study_queue",
      body: state.queue.find((item) => item.id === topic.id)!,
    })),
    ...mergedCards.added.map((card) => ({
      path: "account_cards",
      body: state.cards.find((item) => item.id === card.id)!,
    })),
  ];
  for (const card of state.cards) {
    const old = current.cards.find((currentCard) => currentCard.id === card.id);
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
