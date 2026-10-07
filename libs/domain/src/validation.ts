import {
  BackupData,
  Card,
  ManagedSubject,
  Preferences,
  RemoteActivity,
  RemoteProgress,
  StudyDay,
  StudyItem,
  StudySnapshot,
} from "./models";
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid object");
  return value as Record<string, unknown>;
}
const text = (v: unknown): v is string => typeof v === "string";
const nonempty = (v: unknown) => text(v) && !!v.trim();
const days = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
export const validDate = (v: unknown): v is string =>
  text(v) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const interval = (v: unknown) =>
  Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 365;
function list<T>(
  v: unknown,
  check: (r: Record<string, unknown>) => boolean,
): T[] {
  if (!Array.isArray(v) || v.some((x) => !check(record(x))))
    throw new Error("Invalid collection");
  return v as T[];
}
export const parseSubjects = (v: unknown) =>
  list<ManagedSubject>(
    v,
    (r) =>
      nonempty(r["id"]) &&
      nonempty(r["name"]) &&
      days(r["days"]) &&
      typeof r["archived"] === "boolean" &&
      (r["deck_key"] === undefined || text(r["deck_key"])),
  );
export const parseCards = (v: unknown) =>
  list<Card>(
    v,
    (r) =>
      Number.isSafeInteger(r["id"]) &&
      Number(r["id"]) > 0 &&
      [
        "subject",
        "topic",
        "question",
        "answer",
        "explanation",
        "example",
      ].every((k) => text(r[k])) &&
      nonempty(r["subject"]) &&
      nonempty(r["topic"]) &&
      nonempty(r["question"]) &&
      nonempty(r["answer"]) &&
      validDate(r["due"]) &&
      interval(r["interval"]) &&
      (r["subject_id"] === undefined || text(r["subject_id"])) &&
      (r["topic_id"] === undefined || text(r["topic_id"])),
  );
export const parseTopics = (v: unknown) =>
  list<StudyItem>(
    v,
    (r) =>
      nonempty(r["id"]) &&
      nonempty(r["title"]) &&
      text(r["subject"]) &&
      (r["notes"] === undefined || text(r["notes"])) &&
      ["todo", "done"].includes(String(r["status"])) &&
      ["alta", "media", "baixa"].includes(String(r["priority"])) &&
      (r["link"] === null || text(r["link"])) &&
      (r["completed_at"] === null ||
        (text(r["completed_at"]) &&
          !Number.isNaN(Date.parse(r["completed_at"])))) &&
      (r["subject_id"] === undefined ||
        r["subject_id"] === null ||
        text(r["subject_id"])),
  ).map((x) => ({ ...x, notes: x.notes || "" }));
export const parseHistory = (v: unknown) =>
  list<StudyDay>(
    v,
    (r) =>
      validDate(r["date"]) &&
      Array.isArray(r["learning"]) &&
      Array.isArray(r["reviews"]) &&
      [...r["learning"], ...r["reviews"]].every(text),
  );
export const parseProgress = (v: unknown) =>
  list<RemoteProgress>(
    v,
    (r) =>
      Number.isSafeInteger(Number(r["card_id"])) &&
      Number(r["card_id"]) > 0 &&
      validDate(r["due"]) &&
      interval(Number(r["interval"])),
  ).map((r) => ({
    ...r,
    card_id: Number(r.card_id),
    interval: Number(r.interval),
  }));
export const parseActivity = (v: unknown) =>
  list<RemoteActivity>(
    v,
    (r) =>
      validDate(r["activity_date"]) &&
      ["learning", "review"].includes(String(r["kind"])) &&
      text(r["label"]),
  );
export function parsePreferences(v: unknown): Preferences {
  const r = record(v);
  if (
    (r["display_name"] !== undefined && !text(r["display_name"])) ||
    (r["reminder_time"] !== undefined &&
      (!text(r["reminder_time"]) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(r["reminder_time"]))) ||
    (r["reminder_days"] !== undefined && !days(r["reminder_days"]))
  )
    throw new Error("Invalid preferences");
  return r as Preferences;
}
export function parseSnapshot(v: unknown): StudySnapshot {
  const r = record(v);
  return {
    subjects: parseSubjects(r["subjects"] ?? []),
    queue: parseTopics(r["queue"] ?? []),
    cards: parseCards(r["cards"] ?? []),
    activity: parseActivity(r["activity"] ?? []),
    progress: parseProgress(r["progress"] ?? []),
    preferences: parsePreferences(r["preferences"] ?? {}),
  };
}
export function validateBackup(v: unknown): BackupData {
  const r = record(v);
  if (r["version"] !== 1 && r["version"] !== 2)
    throw new Error("Invalid version");
  if (r["version"] === 1 && !Array.isArray(r["cards"]))
    throw new Error(
      "Este backup antigo contém apenas progresso. Exporte um backup completo com os flashcards no aplicativo anterior.",
    );
  const p = list<{ id: number; due: string; interval: number }>(
    r["progress"],
    (r) =>
      Number.isSafeInteger(r["id"]) &&
      validDate(r["due"]) &&
      interval(r["interval"]),
  );
  const result: BackupData = {
    version: r["version"] as 1 | 2,
    subjects: parseSubjects(r["subjects"]),
    topics: parseTopics(r["topics"]),
    cards: parseCards(r["cards"]),
    history: parseHistory(r["history"]),
    progress: p,
  };
  for (const collection of [
    result.subjects,
    result.topics,
    result.cards,
    result.progress,
  ]) {
    if (new Set(collection.map((item) => item.id)).size !== collection.length)
      throw new Error("Duplicate backup identity");
  }
  return result;
}
