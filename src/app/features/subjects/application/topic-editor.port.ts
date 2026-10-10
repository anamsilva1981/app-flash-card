import { WritableSignal } from "@angular/core";
import { Priority } from "../../../shared/models";

export interface TopicEditorPort {
  studyFormOpen: WritableSignal<boolean>;
  editingStudyId: WritableSignal<string | null>;
  studyTitle: WritableSignal<string>;
  studySubject: WritableSignal<string>;
  studySubjects: () => string[];
  subjectFormOpen: WritableSignal<boolean>;
  newSubjectName: WritableSignal<string>;
  studyNotes: WritableSignal<string>;
  studyLink: WritableSignal<string>;
  studyPriority: WritableSignal<Priority>;
  studyError: WritableSignal<string>;
  studySaving: WritableSignal<boolean>;
  closeStudyForm(): void;
  addStudySubject(): Promise<void>;
  saveStudyItem(): Promise<void>;
}
