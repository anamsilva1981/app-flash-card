import { StudyDay } from './study-history';
import { StudyItem } from './study-plan';
import { ManagedSubject } from './subject-manager.component';

interface BackupCard {
  id: number;
  due: string;
  interval: number;
  [key: string]: unknown;
}

export function createBackup(
  cards: BackupCard[],
  subjects: ManagedSubject[],
  topics: StudyItem[],
  history: StudyDay[]
) {
  return {
    version: 2,
    cards,
    exported_at: new Date().toISOString(),
    subjects,
    topics,
    progress: cards.map(card => ({ id: card.id, due: card.due, interval: card.interval })),
    history
  };
}

export function parseBackup(content: string): any {
  const data = JSON.parse(content);
  validateBackup(data);
  return data;
}

function validateBackup(data: any): void {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const date = /^\\d{4}-\\d{2}-\\d{2}$/;
  if (!data || ![1, 2].includes(data.version) || !Array.isArray(data.subjects) || !Array.isArray(data.topics) || !Array.isArray(data.progress) || !Array.isArray(data.history)) throw new Error('Invalid backup');
  if (data.subjects.some((s: any) => !uuid.test(s.id) || typeof s.name !== 'string' || !s.name.trim() || !Array.isArray(s.days) || s.days.some((d: any) => !Number.isInteger(d) || d < 0 || d > 6) || typeof s.archived !== 'boolean')) throw new Error('Invalid subjects');
  if (data.topics.some((t: any) => !uuid.test(t.id) || typeof t.title !== 'string' || !t.title.trim() || typeof t.subject !== 'string' || typeof t.notes !== 'string' || !['todo', 'done'].includes(t.status) || !['alta', 'media', 'baixa'].includes(t.priority) || (t.link !== null && typeof t.link !== 'string') || (t.completed_at !== null && isNaN(Date.parse(t.completed_at))))) throw new Error('Invalid topics');
  if (data.progress.some((p: any) => !Number.isSafeInteger(p.id) || !date.test(p.due) || !Number.isInteger(p.interval) || p.interval < 0 || p.interval > 365)) throw new Error('Invalid progress');
  if (data.history.some((day: any) => !date.test(day.date) || !Array.isArray(day.learning) || !Array.isArray(day.reviews) || [...day.learning, ...day.reviews].some((x: any) => typeof x !== 'string'))) throw new Error('Invalid history');
  if (data.cards !== undefined && (!Array.isArray(data.cards) || data.cards.some((card: any) => !Number.isSafeInteger(card.id) || card.id < 1 || ['subject', 'topic', 'question', 'answer', 'explanation', 'example'].some(key => typeof card[key] !== 'string') || !card.question.trim() || !card.answer.trim() || !date.test(card.due) || !Number.isInteger(card.interval) || card.interval < 0 || card.interval > 365))) throw new Error('Invalid cards');
}