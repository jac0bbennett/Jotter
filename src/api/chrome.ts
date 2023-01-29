import { ALL_NOTES_KEY, CURRENT_NOTE_KEY, InitialNoteData } from "../types";

export const getInitialNoteData = (
  callback: (data: InitialNoteData) => void
) => {
  chrome.storage.sync.get([CURRENT_NOTE_KEY, ALL_NOTES_KEY], data =>
    callback(data as InitialNoteData)
  );
};

export const getNote = (noteName: string, callback: (data: string) => void) => {
  chrome.storage.sync.get(noteName, data => callback(data[noteName] as string));
};

export const setCurrentNote = (noteName: string) => {
  chrome.storage.sync.set({ [CURRENT_NOTE_KEY]: noteName });
};

export const setNote = (noteName: string, noteContent: string) => {
  chrome.storage.sync.set({ [noteName]: noteContent });
};

export const setAllNotes = (allNotes: string[]) => {
  chrome.storage.sync.set({ [ALL_NOTES_KEY]: allNotes });
};

export const removeNotes = (notes: string[]) => {
  chrome.storage.sync.remove(notes);
};

export const setAppState = (newState: InitialNoteData) => {
  chrome.storage.sync.set(newState);
};
