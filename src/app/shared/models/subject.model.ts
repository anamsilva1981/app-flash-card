export interface ManagedSubject {
  id: string;
  name: string;
  days: number[];
  archived: boolean;
  deck_key?: string;
  routine_initialized?: boolean;
}
