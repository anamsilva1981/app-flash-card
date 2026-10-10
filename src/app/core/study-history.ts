import { StudyDay } from "./models";
export type { StudyDay } from "./models";

export interface CalendarDay {
  date: string | null;
  day: number | null;
  learning: boolean;
  review: boolean;
  today: boolean;
}

export function buildCalendarDays(
  base: Date,
  history: StudyDay[],
  today: string,
): CalendarDay[] {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: CalendarDay[] = [];

  for (let index = 0; index < first.getDay(); index++) {
    cells.push({
      date: null,
      day: null,
      learning: false,
      review: false,
      today: false,
    });
  }

  for (let day = 1; day <= last.getDate(); day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const activity = history.find((item) => item.date === key);
    cells.push({
      date: key,
      day,
      learning: !!activity?.learning.length,
      review: !!activity?.reviews.length,
      today: key === today,
    });
  }

  return cells;
}

export function countStudyDaysInMonth(base: Date, history: StudyDay[]): number {
  const year = base.getFullYear();
  const month = base.getMonth();
  return history.filter((day) => {
    const date = new Date(day.date + "T12:00:00");
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      !!(day.learning.length || day.reviews.length)
    );
  }).length;
}

export function studyStreak(history: StudyDay[], today: string): number {
  const active = new Set(
    history
      .filter((day) => day.learning.length || day.reviews.length)
      .map((day) => day.date),
  );
  const date = new Date(today + "T12:00:00Z");
  if (!active.has(today)) date.setUTCDate(date.getUTCDate() - 1);

  let count = 0;
  while (active.has(date.toISOString().slice(0, 10))) {
    count++;
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return count;
}

export function addStudyActivity(
  history: StudyDay[],
  date: string,
  label: string,
  kind: "learning" | "review",
): StudyDay[] {
  const next = history.map((day) => ({
    ...day,
    learning: [...day.learning],
    reviews: [...day.reviews],
  }));
  let current = next.find((day) => day.date === date);
  if (!current) {
    current = { date, learning: [], reviews: [] };
    next.push(current);
  }

  const target = kind === "learning" ? current.learning : current.reviews;
  if (!target.includes(label)) target.push(label);
  return next.sort((a, b) => b.date.localeCompare(a.date));
}

interface RemoteActivity {
  activity_date: string;
  kind: "learning" | "review";
  label: string;
}

export function historyFromRemote(rows: RemoteActivity[]): StudyDay[] {
  const days = new Map<string, StudyDay>();
  for (const row of rows) {
    if (!days.has(row.activity_date))
      days.set(row.activity_date, {
        date: row.activity_date,
        learning: [],
        reviews: [],
      });
    const day = days.get(row.activity_date)!;
    const target = row.kind === "learning" ? day.learning : day.reviews;
    if (!target.includes(row.label)) target.push(row.label);
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
}
