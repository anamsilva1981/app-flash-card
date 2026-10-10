import { Injectable, inject } from "@angular/core";
import {
  BackupData,
  Card,
  ManagedSubject,
  StudyItem,
} from "../../shared/models";
import { StudyRepository } from "./study-repository";

@Injectable()
export class StudyLifecycleRepository {
  private readonly repository = inject(StudyRepository);
  initialize() {
    return this.repository.initialize();
  }
}

@Injectable()
export class CardsRepository {
  private readonly repository = inject(StudyRepository);
  saveCard(card: Card) {
    return this.repository.saveCard(card);
  }
  rateCard(card: Card, label: string, rating: string) {
    return this.repository.rateCard(card, label, rating);
  }
}

@Injectable()
export class ReviewRepository extends CardsRepository {}

@Injectable()
export class SubjectsRepository {
  private readonly repository = inject(StudyRepository);
  saveSubject(subject: ManagedSubject, previous?: ManagedSubject) {
    return this.repository.saveSubject(subject, previous);
  }
}

@Injectable()
export class StudyPlanRepository {
  private readonly repository = inject(StudyRepository);
  saveTopic(item: StudyItem) {
    return this.repository.saveTopic(item);
  }
  saveSubject(subject: ManagedSubject, previous?: ManagedSubject) {
    return this.repository.saveSubject(subject, previous);
  }
  completeTopic(item: StudyItem) {
    return this.repository.completeTopic(item);
  }
}

@Injectable()
export class SettingsRepository {
  private readonly repository = inject(StudyRepository);
  importBackup(data: BackupData) {
    return this.repository.importBackup(data);
  }
}
