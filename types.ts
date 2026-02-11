
export interface Calculation {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface AppState {
  history: Calculation[];
  notes: Note[];
  currentNoteId: string | null;
}
