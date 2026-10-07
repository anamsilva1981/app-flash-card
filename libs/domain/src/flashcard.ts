import { belongsToSubject, resolveSubject } from "./relations";
import { Card, ManagedSubject } from "./models";
export type { Card } from "./models";

export function createCard(draft: Card): Card {
  if (
    !draft.subject ||
    !draft.topic.trim() ||
    !draft.question.trim() ||
    !draft.answer.trim()
  ) {
    throw new Error("Required flashcard fields are missing");
  }
  return {
    ...draft,
    id: draft.id || numericCardId(),
    topic: draft.topic.trim(),
    question: draft.question.trim(),
    answer: draft.answer.trim(),
  };
}

export function upsertCard(cards: Card[], card: Card): Card[] {
  return cards.some((current) => current.id === card.id)
    ? cards.map((current) => (current.id === card.id ? card : current))
    : [...cards, card];
}

export function cardsForSubject(
  cards: Card[],
  subject: string | null,
  subjects: ManagedSubject[] = [],
): Card[] {
  if (!subject) return [];
  const selected =
    subjects.find((item) => item.id === subject) ||
    resolveSubject(subjects, subject);
  return cards.filter((card) =>
    selected
      ? belongsToSubject(card, selected)
      : card.subject_id === subject ||
        (!card.subject_id && card.subject === subject),
  );
}

export function cardTopics(cards: Card[]): string[] {
  return [
    "__all__",
    ...Array.from(new Set(cards.map((card) => card.topic_id || card.topic))),
  ];
}

export function countDueCards(
  cards: Card[],
  subject: string,
  today: string,
  subjects: ManagedSubject[] = [],
): number {
  return cardsForSubject(cards, subject, subjects).filter(
    (card) => card.due <= today,
  ).length;
}

export function countSubjectCards(
  cards: Card[],
  subject: string,
  subjects: ManagedSubject[] = [],
): number {
  return cardsForSubject(cards, subject, subjects).length;
}

export function numericCardId(
  uuid: () => string = () => crypto.randomUUID(),
): number {
  return Number.parseInt(uuid().replace(/-/g, "").slice(0, 13), 16) || 1;
}
