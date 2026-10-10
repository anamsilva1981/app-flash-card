import { Injectable, inject } from "@angular/core";
import { StudyStore } from "../../../core/state/study-store";
import { SubjectsRepository } from "../../../core/application/feature-repositories";
import { I18nService } from "../../../core/i18n/i18n.service";
import { Card, ManagedSubject, StudyItem } from "../../../shared/models";
import { belongsToSubject } from "../../../shared/domain/relations";
import { sortStudyItems } from "../../../shared/domain/study-plan";
import { studyDate } from "../../../shared/utils/study-clock";

@Injectable()
export class SubjectsFacade {
  private readonly store = inject(StudyStore);
  private readonly repository = inject(SubjectsRepository);
  readonly subjects = this.store.subjects;
  readonly i18n = inject(I18nService);

  subjectCards(subject: ManagedSubject | null, cards: Card[]) {
    return subject
      ? cards.filter((card) => belongsToSubject(card, subject))
      : [];
  }

  dueCards(subject: ManagedSubject | null, cards: Card[]) {
    return this.subjectCards(subject, cards).filter(
      (card) => card.due <= studyDate(),
    );
  }

  subjectTopics(
    subject: ManagedSubject | null,
    items: StudyItem[],
    view: "todo" | "done",
  ) {
    return subject
      ? sortStudyItems(
          items.filter(
            (item) => belongsToSubject(item, subject) && item.status === view,
          ),
          view === "done",
        )
      : [];
  }

  save(subject: ManagedSubject, previous?: ManagedSubject) {
    return this.repository.saveSubject(subject, previous);
  }

  archive(subject: ManagedSubject) {
    return this.repository.saveSubject({ ...subject, archived: true }, subject);
  }

  restore(subject: ManagedSubject) {
    return this.repository.saveSubject(
      { ...subject, archived: false },
      subject,
    );
  }
}
