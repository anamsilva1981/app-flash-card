import type { ManagedSubject } from "../models";

export function activeSubjects(subjects: ManagedSubject[]): ManagedSubject[] {
  return subjects.filter((subject) => !subject.archived);
}

export function subjectsForToday(
  subjects: ManagedSubject[],
  today: string,
): ManagedSubject[] {
  const day = new Date(today + "T12:00:00").getDay();
  return activeSubjects(subjects).filter((subject) =>
    subject.days.includes(day),
  );
}
