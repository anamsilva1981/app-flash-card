import { Injectable, signal, computed } from "@angular/core";
import { Card, ManagedSubject, StudyDay, StudyItem } from "../../shared/models";
import { cached } from "../persistence/sync";
import {
  activeSubjects,
  subjectsForToday,
} from "../../shared/domain/subject-selectors";
import { studyDate } from "../../shared/utils/study-clock";
@Injectable()
export class StudyStore {
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
    subjectsForToday(this.subjects(), studyDate()),
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
