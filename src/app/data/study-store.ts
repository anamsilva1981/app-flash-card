import { computed, inject, Injectable, signal } from "@angular/core";
import { Card, ManagedSubject, StudyDay, StudyItem } from "../models";
import { StudyClock } from "../platform/study-clock-service";
import { activeSubjects, subjectsForToday } from "../subject-selectors";
import { cached } from "../sync";
@Injectable()
export class StudyStore {
  private clock = inject(StudyClock);
  readonly cards = signal<Card[]>(cached("flashcards", []));
  readonly subjects = signal<ManagedSubject[]>(
    cached("study-subject-config", []),
  );
  readonly queue = signal<StudyItem[]>(cached("study-queue", []));
  readonly history = signal<StudyDay[]>(cached("study-history", []));
  readonly displayName = signal(cached("display-name", ""));
  readonly error = signal("");
  readonly activeSubjects = computed(() => activeSubjects(this.subjects()));
  readonly todaysSubjects = computed(() =>
    subjectsForToday(this.subjects(), this.clock.today()),
  );
  snapshot() {
    return {
      cards: this.cards(),
      subjects: this.subjects(),
      queue: this.queue(),
      history: this.history(),
    };
  }
  apply(state: ReturnType<StudyStore["snapshot"]>) {
    this.cards.set(state.cards);
    this.subjects.set(state.subjects);
    this.queue.set(state.queue);
    this.history.set(state.history);
  }
  restoreCache() {
    this.apply({
      cards: cached("flashcards", []),
      subjects: cached("study-subject-config", []),
      queue: cached("study-queue", []),
      history: cached("study-history", []),
    });
    this.displayName.set(cached("display-name", ""));
  }
}
