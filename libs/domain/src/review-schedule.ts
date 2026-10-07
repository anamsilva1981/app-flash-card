import { ManagedSubject } from "./models";
import { belongsToSubject, resolveSubject } from "./relations";
import { Rating } from "./models";
export type { Rating } from "./models";
export function intervalFor(previous: number, rating: Rating): number {
  if (rating === "again") return 1;
  if (previous <= 0) return { hard: 2, good: 4, easy: 7 }[rating];
  return Math.min(
    365,
    Math.max(
      previous + 1,
      Math.round(previous * { hard: 1.2, good: 2.2, easy: 3 }[rating]),
    ),
  );
}
export interface ReviewCard {
  id: number;
  subject: string;
  subject_id?: string;
  topic: string;
  topic_id?: string;
  due: string;
  interval: number;
}

export function dueReviewCards<T extends ReviewCard>(
  cards: T[],
  subject: string | null,
  topic: string,
  today: string,
  subjects: ManagedSubject[] = [],
): T[] {
  if (!subject) return [];
  const selected =
    subjects.find((item) => item.id === subject) ||
    resolveSubject(subjects, subject);
  return cards
    .filter(
      (card) =>
        (selected
          ? belongsToSubject(card, selected)
          : card.subject_id === subject || card.subject === subject) &&
        card.due <= today &&
        (topic === "__all__" || (card.topic_id || card.topic) === topic),
    )
    .sort((a, b) => a.due.localeCompare(b.due) || a.id - b.id);
}

export function buildReviewSession<T extends ReviewCard>(
  cards: T[],
  limit: number,
  random: () => number = Math.random,
): number[] {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const selected = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[selected]] = [
      shuffled[selected],
      shuffled[index],
    ];
  }
  return shuffled.slice(0, limit || shuffled.length).map((card) => card.id);
}

export function rateReviewCard<T extends ReviewCard>(
  card: T,
  rating: Rating,
  due: string,
): T {
  const days = intervalFor(card.interval, rating);
  return { ...card, due, interval: days };
}

export function totalDueCards<T extends ReviewCard>(
  cards: T[],
  subjects: ManagedSubject[],
  today: string,
): number {
  return cards.filter(
    (card) =>
      card.due <= today &&
      subjects.some((subject) => belongsToSubject(card, subject)),
  ).length;
}
