import { StudyItem } from "../../../shared/models";
export type { StudyItem } from "../../../shared/models";

export function normalizeStudyLink(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const url = new URL(
    /^[a-z]+:/i.test(normalized) ? normalized : `https://${normalized}`,
  );
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Unsupported study link protocol");

  return url.href;
}

export function sortStudyItems(
  items: StudyItem[],
  completed = false,
): StudyItem[] {
  const priority = { alta: 0, media: 1, baixa: 2 };
  return [...items].sort((a, b) => {
    if (completed) {
      return (b.completed_at || "").localeCompare(a.completed_at || "");
    }
    return (
      priority[a.priority] - priority[b.priority] ||
      (a.created_at || "").localeCompare(b.created_at || "")
    );
  });
}

export function upsertStudyItem(
  items: StudyItem[],
  item: StudyItem,
  editingId: string | null,
): StudyItem[] {
  return editingId
    ? items.map((current) => (current.id === editingId ? item : current))
    : [...items, item];
}

export function renameStudyItemsSubject(
  items: StudyItem[],
  previous: string,
  name: string,
): StudyItem[] {
  return items.map((item) =>
    item.subject === previous ? { ...item, subject: name } : item,
  );
}

export function completeStudyItem(
  items: StudyItem[],
  id: string,
  completedAt: string,
): StudyItem[] {
  return items.map((item) =>
    item.id === id
      ? { ...item, status: "done", completed_at: completedAt }
      : item,
  );
}

export function pendingStudyItems(
  items: StudyItem[],
  subject: string,
): StudyItem[] {
  return sortStudyItems(
    items.filter((item) => item.status === "todo" && item.subject === subject),
  );
}

export function nextStudyItem(
  items: StudyItem[],
  subject: string,
): StudyItem | undefined {
  return pendingStudyItems(items, subject)[0];
}
