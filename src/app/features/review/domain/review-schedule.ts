export type Rating = "again" | "hard" | "good" | "easy";
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
export function sortTopics<
  T extends {
    priority: string;
    created_at?: string;
    completed_at?: string | null;
  },
>(items: T[], done = false): T[] {
  const rank: Record<string, number> = { alta: 0, media: 1, baixa: 2 };
  return [...items].sort((a, b) =>
    done
      ? (b.completed_at || "").localeCompare(a.completed_at || "")
      : rank[a.priority] - rank[b.priority] ||
        (a.created_at || "").localeCompare(b.created_at || ""),
  );
}

export interface ReviewCard {
  id: number;
  subject: string;
  topic: string;
  due: string;
  interval: number;
}

export function dueReviewCards<T extends ReviewCard>(
  cards: T[],
  subject: string | null,
  topic: string,
  today: string,
): T[] {
  if (!subject) return [];
  return cards
    .filter(
      (card) =>
        card.subject === subject &&
        card.due <= today &&
        (topic === "Todos" || card.topic === topic),
    )
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function reviewSessionIds<T extends ReviewCard>(
  cards: T[],
  subject: string | null,
  topic: string,
  today: string,
  limit: number,
): number[] {
  const due = dueReviewCards(cards, subject, topic, today);
  return (limit > 0 ? due.slice(0, limit) : due).map((card) => card.id);
}
