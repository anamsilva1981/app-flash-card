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
  return JSON.parse(content);
}
