import { vi } from "vitest";
import { NotesState } from "../../hooks/useNotes";

export const mockNotesState: NotesState = {
  allNotes: [],
  curNote: "",
  noteContent: "",
  syncAllNotes: vi.fn(),
  syncCurNote: vi.fn(),
  syncNoteContent: vi.fn(),
  deleteNotes: vi.fn(),
  getNoteData: vi.fn(),
  addNote: vi.fn(),
  setNoteContent: vi.fn(),
};
