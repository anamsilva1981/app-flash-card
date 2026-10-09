export interface Card {
  id: number;
  subject: string;
  subject_id?: string;
  topic: string;
  topic_id?: string;
  question: string;
  answer: string;
  explanation: string;
  example: string;
  think?: string;
  due: string;
  interval: number;
}
