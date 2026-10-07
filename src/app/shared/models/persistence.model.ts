import type { Card } from "./card.model";
import type { ManagedSubject } from "./subject.model";
import type { StudyDay, StudyItem } from "./study.model";

export interface RemoteProgress {
  card_id: number;
  due: string;
  interval: number;
}

export interface RemoteActivity {
  activity_date: string;
  kind: "learning" | "review";
  label: string;
}

export interface Preferences {
  display_name?: string;
  reminder_time?: string;
  reminder_days?: number[];
}

export interface StudySnapshot {
  subjects: ManagedSubject[];
  queue: StudyItem[];
  cards: Card[];
  activity: RemoteActivity[];
  progress: RemoteProgress[];
  preferences: Preferences;
}

export interface BackupData {
  version: 1 | 2;
  cards: Card[];
  subjects: ManagedSubject[];
  topics: StudyItem[];
  progress: Array<{ id: number; due: string; interval: number }>;
  history: StudyDay[];
}

export interface OperationInput {
  path: string;
  body: unknown;
  method?: string;
  prefer?: string;
}

export interface Operation extends OperationInput {
  id: string;
}

export const EMPTY_SNAPSHOT: StudySnapshot = {
  subjects: [],
  queue: [],
  cards: [],
  activity: [],
  progress: [],
  preferences: {},
};
