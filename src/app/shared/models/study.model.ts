export type Priority = "baixa" | "media" | "alta";

export interface StudyItem {
  id: string;
  title: string;
  subject: string;
  subject_id?: string | null;
  notes: string;
  link: string | null;
  priority: Priority;
  status: "todo" | "done";
  completed_at: string | null;
  created_at?: string;
}

export interface StudyDay {
  date: string;
  learning: string[];
  reviews: string[];
}
