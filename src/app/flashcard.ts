export interface Card {
  id: number;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  example: string;
  due: string;
  interval: number;
}

export function createCard(draft: Card): Card {
  if (!draft.subject || !draft.topic.trim() || !draft.question.trim() || !draft.answer.trim()) {
    throw new Error('Required flashcard fields are missing');
  }
  return {
    ...draft,
    id: draft.id || Date.now(),
    topic: draft.topic.trim(),
    question: draft.question.trim(),
    answer: draft.answer.trim()
  };
}

export function upsertCard(cards: Card[], card: Card): Card[] {
  return cards.some(current => current.id === card.id)
    ? cards.map(current => current.id === card.id ? card : current)
    : [...cards, card];
}
