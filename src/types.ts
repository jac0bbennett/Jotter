export type BaseAppState = {
  curNote: string;
  allNotes: string[];
};

export type LinkInfo = {
  top: number;
  url: string;
  target: HTMLAnchorElement | null;
};

export enum Views {
  NOTE = "note",
  ALLNOTES = "allNotes",
  NEWNOTE = "newNote",
}

export enum Themes {
  DEFAULT = "default",
  ALT = "alt",
  JONAH = "jonah",
}

export const CURRENT_NOTE_KEY = "curNote";
export const ALL_NOTES_KEY = "allNotes";
export const THEME_KEY = "theme";

export const PROHIBITED_NOTE_NAMES = [CURRENT_NOTE_KEY, ALL_NOTES_KEY];

export const DEFAULT_NOTE_NAME = "main";

export const MAX_NOTE_LENGTH_BYTES = 8150;
export const MAX_TITLE_LENGTH = 40;
export const MAX_NOTE_COUNT = 50;
