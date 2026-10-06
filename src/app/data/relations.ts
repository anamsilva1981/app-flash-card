import { Card, ManagedSubject, StudyItem, StudySnapshot } from "../models";
export function resolveSubject(
  subjects: ManagedSubject[],
  key: string,
  id?: string | null,
) {
  return subjects.find((s) =>
    id ? s.id === id : s.name === key || (s.deck_key || s.name) === key,
  );
}
export function belongsToSubject(
  item: { subject: string; subject_id?: string | null },
  subject: ManagedSubject,
) {
  return item.subject_id
    ? item.subject_id === subject.id
    : item.subject === subject.name ||
        item.subject === (subject.deck_key || subject.name);
}
export function normalizeRelations<
  T extends Pick<StudySnapshot, "subjects" | "queue" | "cards">,
>(state: T): T {
  const queue = state.queue.map((item) => {
    const s = resolveSubject(state.subjects, item.subject, item.subject_id);
    return {
      ...item,
      subject_id: s?.id ?? item.subject_id ?? null,
      subject: s?.name || item.subject,
    };
  });
  const cards = state.cards.map((card) => {
    const s = resolveSubject(state.subjects, card.subject, card.subject_id);
    const topic = queue.find(
      (t) =>
        (s ? belongsToSubject(t, s) : t.subject === card.subject) &&
        t.title === card.topic,
    );
    return {
      ...card,
      ...(s ? { subject_id: s.id, subject: s.deck_key || s.name } : {}),
      ...(topic ? { topic_id: topic.id } : {}),
    };
  });
  return { ...state, queue, cards };
}
export function renameSubjectRelations(
  cards: Card[],
  topics: StudyItem[],
  subject: ManagedSubject,
  previous: string,
) {
  return {
    cards: cards.map((c) =>
      c.subject_id === subject.id ||
      (!c.subject_id &&
        (c.subject === previous ||
          c.subject === (subject.deck_key || previous)))
        ? {
            ...c,
            subject_id: subject.id,
            subject: subject.deck_key || subject.name,
          }
        : c,
    ),
    queue: topics.map((t) =>
      t.subject_id === subject.id || (!t.subject_id && t.subject === previous)
        ? { ...t, subject_id: subject.id, subject: subject.name }
        : t,
    ),
  };
}
