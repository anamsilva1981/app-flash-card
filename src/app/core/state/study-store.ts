import { Injectable, signal, computed } from "@angular/core";
import {
  Card,
  ManagedSubject,
  StudyDay,
  StudyItem,
  Rating,
} from "../../shared/models";
import { cache, cached } from "../persistence/sync";
import {
  activeSubjects,
  subjectsForToday,
} from "../../shared/domain/subject-selectors";
import { studyDate } from "../../shared/utils/study-clock";
import { xpForRating } from "../../shared/domain/gamification";
interface ReviewStats {
  date: string;
  reviewed: number;
  correct: number;
  xp: number;
}
@Injectable()
export class StudyStore {
  readonly cards = signal<Card[]>(cached("flashcards", []));
  readonly subjects = signal<ManagedSubject[]>(
    cached("study-subject-config", []),
  );
  readonly queue = signal<StudyItem[]>(cached("study-queue", []));
  readonly history = signal<StudyDay[]>(cached("study-history", []));
  readonly displayName = signal(cached("display-name", ""));
  readonly xp = signal(cached("study-xp", 0));
  readonly reviewStats = signal<ReviewStats>(
    cached("review-stats", {
      date: studyDate(),
      reviewed: 0,
      correct: 0,
      xp: 0,
    }),
  );
  readonly todayReviews = computed(() =>
    this.reviewStats().date === studyDate() ? this.reviewStats().reviewed : 0,
  );
  readonly todayCorrect = computed(() =>
    this.reviewStats().date === studyDate() ? this.reviewStats().correct : 0,
  );
  readonly todayXp = computed(() =>
    this.reviewStats().date === studyDate() ? this.reviewStats().xp : 0,
  );
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
    this.xp.set(cached("study-xp", 0));
    this.reviewStats.set(
      cached("review-stats", {
        date: studyDate(),
        reviewed: 0,
        correct: 0,
        xp: 0,
      }),
    );
  }
  recordReview(rating: Rating) {
    const today = studyDate();
    const previous = this.reviewStats();
    const current =
      previous.date === today
        ? previous
        : { date: today, reviewed: 0, correct: 0, xp: 0 };
    const points = xpForRating(rating);
    const next = {
      date: today,
      reviewed: current.reviewed + 1,
      correct: current.correct + (rating === "again" ? 0 : 1),
      xp: current.xp + points,
    };
    this.xp.update((value) => value + points);
    this.reviewStats.set(next);
    cache("study-xp", this.xp());
    cache("review-stats", next);
  }
}
