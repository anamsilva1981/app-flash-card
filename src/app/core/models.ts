export type Rating = "again" | "hard" | "good" | "easy";
export type Priority = "baixa" | "media" | "alta";
export interface ManagedSubject {
  id: string;
  name: string;
  days: number[];
  archived: boolean;
  deck_key?: string;
  routine_initialized?: boolean;
}
export interface Card {
  id: number;
  subject: string;
  subject_id?: string;
  topic: string;
  topic_id?: string;
  question: string;
  answer: string;
  explanation: string;
  example: string;
  due: string;
  interval: number;
}
export interface StudyItem {
  id: string;
  title: string;
  subject: string;
  subject_id?: string | null;
  notes: string;
  link: string | null;
  priority: Priority;
  status: "todo" | "done";
  completed_at: string | null;
  created_at?: string;
}
export interface StudyDay {
  date: string;
  learning: string[];
  reviews: string[];
}
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
export interface AppNotice {
  type: "success" | "error" | "info";
  title: string;
  text: string;
}
export const EMPTY_SNAPSHOT: StudySnapshot = {
  subjects: [],
  queue: [],
  cards: [],
  activity: [],
  progress: [],
  preferences: {},
};
