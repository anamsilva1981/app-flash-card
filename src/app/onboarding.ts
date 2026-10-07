import { ManagedSubject } from "./models";
import { belongsToSubject } from "./data/relations";
import { StudyItem } from "./study-plan";

export type OnboardingStep = "deck" | "topic" | "routine" | "card" | "done";

interface OnboardingCard {
  subject: string;
}

export function onboardingStepFor(
  dismissed: boolean,
  subjects: ManagedSubject[],
  studyItems: StudyItem[],
  cards: OnboardingCard[],
): OnboardingStep {
  if (dismissed || cards.length) return "done";
  if (!subjects.length) return "deck";

  const first = subjects[0];
  if (
    !studyItems.some((item) =>
      subjects.some((subject) => belongsToSubject(item, subject)),
    )
  )
    return "topic";
  if (!first.days?.length) return "routine";

  return "card";
}
