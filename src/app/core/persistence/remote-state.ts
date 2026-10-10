import {
  Card,
  RemoteActivity,
  RemoteProgress,
  Preferences,
  StudyDay,
  StudyItem,
} from "../../shared/models";
import {
  parseCards,
  parseTopics,
  parseActivity,
  parseProgress,
  parsePreferences,
} from "./validation";

export type ApiReader = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;

async function read<T>(
  api: ApiReader,
  path: string,
  parse: (value: unknown) => T,
): Promise<T | null> {
  const response = await api(path);
  return response.ok ? parse(await response.json()) : null;
}

function historyFromRemote(rows: RemoteActivity[]): StudyDay[] {
  const days = new Map<string, StudyDay>();
  for (const row of rows) {
    if (!days.has(row.activity_date)) {
      days.set(row.activity_date, {
        date: row.activity_date,
        learning: [],
        reviews: [],
      });
    }
    const day = days.get(row.activity_date)!;
    const target = row.kind === "learning" ? day.learning : day.reviews;
    if (!target.includes(row.label)) target.push(row.label);
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export const readRemoteCards = (api: ApiReader): Promise<Card[] | null> =>
  read(api, "account_cards", parseCards);
export const readRemotePreferences = (
  api: ApiReader,
): Promise<Preferences | null> =>
  read(api, "account_preferences", parsePreferences);
export const readRemoteStudyQueue = (
  api: ApiReader,
): Promise<StudyItem[] | null> => read(api, "study_queue", parseTopics);
export const readRemoteHistory = (api: ApiReader): Promise<StudyDay[] | null> =>
  read(api, "study_activity", (value) =>
    historyFromRemote(parseActivity(value)),
  );
export const readRemoteProgress = (
  api: ApiReader,
): Promise<RemoteProgress[] | null> =>
  read(api, "seed_card_progress", parseProgress);
