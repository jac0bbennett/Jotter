export interface LinkInfo {
  top: number;
  url: string;
  target: HTMLAnchorElement | null;
}

export enum Views {
  NOTE = "note",
  ALLNOTES = "allNotes",
  NEWNOTE = "newNote"
}
