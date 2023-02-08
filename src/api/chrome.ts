import { Themes } from "./../types";
import { ALL_NOTES_KEY, CURRENT_NOTE_KEY, BaseAppState } from "../types";

export const getInitialNoteData = (callback: (data: BaseAppState) => void) => {
  chrome.storage.sync.get([CURRENT_NOTE_KEY, ALL_NOTES_KEY], (data) =>
    callback(data as BaseAppState)
  );
};

export const getNoteNames = (callback: (data: string[]) => void) => {
  chrome.storage.sync.get(ALL_NOTES_KEY, (data) =>
    callback(data[ALL_NOTES_KEY] as string[])
  );
};

export const getCurrentNote = (callback: (data: string) => void) => {
  chrome.storage.local.get(CURRENT_NOTE_KEY, (data) =>
    callback(data[CURRENT_NOTE_KEY] as string)
  );
};

export const getNote = (noteName: string, callback: (data: string) => void) => {
  chrome.storage.sync.get(noteName, (data) =>
    callback(data[noteName] as string)
  );
};

export const setCurrentNote = (noteName: string) => {
  chrome.storage.sync.set({ [CURRENT_NOTE_KEY]: noteName });
};

export const setNote = (
  noteName: string,
  noteContent: string,
  callback?: () => void
) => {
  chrome.storage.sync.set({ [noteName]: noteContent }, callback);
};

export const setAllNotes = (allNotes: string[]) => {
  chrome.storage.sync.set({ [ALL_NOTES_KEY]: allNotes });
};

export const removeNotes = (notes: string[]) => {
  chrome.storage.sync.remove(notes);
};

export const setBaseAppState = (newState: BaseAppState) => {
  chrome.storage.sync.set(newState);
};

export const setTheme = (theme: Themes | null) => {
  chrome.storage.local.set({ theme });
  document.body.setAttribute("data-theme", theme ?? "default");
  switch (theme) {
    case Themes.ALT:
      chrome.action.setIcon({ path: "icon48alt.png" });
      break;
    case Themes.JONAH:
      chrome.action.setIcon({ path: "icon48jonah.png" });
      break;
    default:
      chrome.action.setIcon({ path: "icon48.png" });
      break;
  }
};
