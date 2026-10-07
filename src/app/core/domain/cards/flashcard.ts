import { Card } from "@shared/models";
export type { Card } from "@shared/models";

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
    id: draft.id || Date.now(),
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

export function cardsForSubject(cards: Card[], subject: string | null): Card[] {
  return subject ? cards.filter((card) => card.subject === subject) : [];
}

export function cardTopics(cards: Card[]): string[] {
  return ["Todos", ...Array.from(new Set(cards.map((card) => card.topic)))];
}

export function countDueCards(
  cards: Card[],
  subject: string,
  today: string,
): number {
  return cards.filter((card) => card.subject === subject && card.due <= today)
    .length;
}

export function countSubjectCards(cards: Card[], subject: string): number {
  return cards.filter((card) => card.subject === subject).length;
}
