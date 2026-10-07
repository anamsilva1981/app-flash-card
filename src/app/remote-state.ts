import {
  parseActivity,
  parseCards,
  parsePreferences,
  parseProgress,
  parseTopics,
} from "./data/validation";
import { Card, Preferences, RemoteProgress, StudyItem } from "./models";
import { historyFromRemote, StudyDay } from "./study-history";
export type ApiReader = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;
async function read<T>(
  api: ApiReader,
  path: string,
  parse: (value: unknown) => T,
): Promise<T | null> {
  const r = await api(path);
  return r.ok ? parse(await r.json()) : null;
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
  read(api, "study_activity", (x) => historyFromRemote(parseActivity(x)));
export const readRemoteProgress = (
  api: ApiReader,
): Promise<RemoteProgress[] | null> =>
  read(api, "seed_card_progress", parseProgress);
