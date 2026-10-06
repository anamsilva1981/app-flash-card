import { Card } from './flashcard';
import { historyFromRemote, StudyDay } from './study-history';
import { StudyItem } from './study-plan';

export type ApiReader = (path: string, options?: RequestInit) => Promise<Response>;

export async function readRemoteCards(api: ApiReader): Promise<Card[] | null> {
  const response = await api('account_cards');
  return response.ok ? response.json() : null;
}

export async function readRemotePreferences(api: ApiReader): Promise<any | null> {
  const response = await api('account_preferences');
  return response.ok ? response.json() : null;
}

export async function readRemoteStudyQueue(api: ApiReader): Promise<StudyItem[] | null> {
  const response = await api('study_queue?select=id,title,subject,notes,link,priority,status,completed_at,created_at&order=created_at.asc');
  if (!response.ok) return null;
  const rows: StudyItem[] = await response.json();
  return rows.map(item => ({ ...item, notes: item.notes || '' }));
}

export async function readRemoteHistory(api: ApiReader): Promise<StudyDay[] | null> {
  const response = await api('study_activity?select=activity_date,kind,label&order=activity_date.desc,created_at.asc');
  return response.ok ? historyFromRemote(await response.json()) : null;
}

export async function readRemoteProgress(api: ApiReader): Promise<any[] | null> {
  const response = await api('seed_card_progress?select=card_id,due,interval');
  return response.ok ? response.json() : null;
}
