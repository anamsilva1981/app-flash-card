export interface StudyItem {
  id: string;
  title: string;
  subject: string;
  notes: string;
  link: string | null;
  priority: 'baixa' | 'media' | 'alta';
  status: 'todo' | 'done';
  completed_at: string | null;
  created_at?: string;
}

export function normalizeStudyLink(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const url = new URL(/^[a-z]+:/i.test(normalized) ? normalized : `https://${normalized}`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported study link protocol');

  return url.href;
}

export function sortStudyItems(items: StudyItem[], completed = false): StudyItem[] {
  const priority = { alta: 0, media: 1, baixa: 2 };
  return [...items].sort((a, b) => {
    if (completed) {
      return (b.completed_at || '').localeCompare(a.completed_at || '');
    }
    return priority[a.priority] - priority[b.priority]
      || (a.created_at || '').localeCompare(b.created_at || '');
  });
}
