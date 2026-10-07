import { Card, RemoteProgress } from "../../../shared/models";

export function mergeCardProgress(
  cards: Card[],
  rows: RemoteProgress[],
): Card[] {
  const progress = new Map(rows.map((row) => [Number(row.card_id), row]));
  return cards.map((card) => {
    const saved = progress.get(card.id);
    return saved
      ? { ...card, due: saved.due, interval: Number(saved.interval) }
      : card;
  });
}

export function restoreCompletedReviews(
  cards: Card[],
  reviewed: string[],
  today: string,
  tomorrow: string,
  subjectNames: Record<string, string> = {},
): Card[] {
  return cards.map((card) => {
    const subject = subjectNames[card.subject] || card.subject;
    const label = `${subject} — ${card.topic}`;
    const completed = reviewed.includes(subject) || reviewed.includes(label);
    return completed && card.due <= today
      ? { ...card, due: tomorrow, interval: 1 }
      : card;
  });
}
