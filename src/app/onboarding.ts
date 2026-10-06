import { ManagedSubject } from './subject-manager.component';
import { StudyItem } from './study-plan';

export type OnboardingStep = 'deck' | 'topic' | 'routine' | 'card' | 'done';

interface OnboardingCard {
  subject: string;
}

export function onboardingStepFor(
  dismissed: boolean,
  subjects: ManagedSubject[],
  studyItems: StudyItem[],
  cards: OnboardingCard[]
): OnboardingStep {
  if (dismissed) return 'done';
  if (!subjects.length) return 'deck';

  const first = subjects[0];
  if (!studyItems.some(item => item.subject === first.name)) return 'topic';
  if (!first.days?.length) return 'routine';

  const deck = first.deck_key || first.name;
  if (!cards.some(card => card.subject === deck || card.subject === first.name)) return 'card';

  return 'done';
}
