import { useEffect, useMemo, useReducer } from "react";
import {
  DEFAULT_NOTE_NAME,
  BaseAppState,
  MAX_NOTE_COUNT,
  MAX_TITLE_LENGTH,
  PROHIBITED_NOTE_NAMES,
  MAX_NOTE_LENGTH_BYTES,
} from "../types";
import * as chromeApi from "../api/chrome";
import { notesStateReducer, NotesReducerState } from "../reducers/notesState";

const initialState: NotesReducerState = {
  allNotes: [],
  curNote: DEFAULT_NOTE_NAME,
  noteContent: "",
};

export type NotesState = {
  allNotes: string[];
  curNote: string;
  noteContent: string;
  syncAllNotes: (allNotes: string[]) => void;
  syncCurNote: (curNote: string) => void;
  syncNoteContent: (noteContent: string, callback?: () => void) => void;
  setNoteContent: (noteContent: string) => void;
  deleteNotes: (notes: string[]) => void;
  addNote: (noteName: string) => void;
  getNoteData: (noteName: string, callback: (data: string) => void) => void;
};

export const useNotes = (): NotesState => {
  const [state, dispatch] = useReducer(notesStateReducer, initialState);

  useEffect(() => {
    getInitialData();
  }, []);

  const setAppState = (newState: NotesReducerState) => {
    dispatch({ type: "setAppState", payload: newState });
  };

  const syncBaseAppState = (newState: BaseAppState) => {
    chromeApi.setBaseAppState(newState);
    dispatch({ type: "setBaseAppState", payload: newState });
  };

  const syncAllNotes = (allNotes: string[]) => {
    chromeApi.setAllNotes(allNotes);
    dispatch({ type: "setAllNotes", payload: allNotes });
  };

  const syncCurNote = (curNote: string) => {
    if (!curNote) return;
    chromeApi.getNote(curNote, (note) => {
      setNoteContent(note || "");
    });

    if (state.allNotes.includes(curNote)) {
      chromeApi.setCurrentNote(curNote);
      dispatch({ type: "setCurNote", payload: [curNote] });
    } else {
      validateNoteName(curNote);

      const newAllNotes = [curNote, ...state.allNotes];
      syncBaseAppState({ curNote, allNotes: newAllNotes });
    }
  };

  const syncNoteContent = (
    noteContent: string = state.noteContent,
    callback?: (error?: Error) => void
  ) => {
    console.log(state);
    chromeApi.setNote(state.curNote, noteContent, () => {
      if (chrome.runtime.lastError) {
        callback?.(
          new Error(
            "Failed to Save! Total data may be exceeding Chrome limits!"
          )
        );
      } else {
        callback?.();
      }
    });
  };

  const setNoteContent = (noteContent: string) => {
    dispatch({ type: "setNoteContent", payload: [noteContent] });
    if (noteContent.length > MAX_NOTE_LENGTH_BYTES) {
      throw new Error("Note exceeding max length! Cannot save!");
    }
  };

  const validateNoteName = (noteName: string) => {
    if (PROHIBITED_NOTE_NAMES.includes(noteName)) {
      throw new Error("Invalid note name!");
    } else if (!noteName) {
      throw new Error("Name can't be blank!");
    } else if (state.allNotes.includes(noteName)) {
      throw new Error("Name must be unique!");
    } else if (noteName.length > MAX_TITLE_LENGTH) {
      throw new Error(`Name too long! (<=${MAX_TITLE_LENGTH})`);
    } else if (state.allNotes.length >= MAX_NOTE_COUNT) {
      throw new Error(`Cannot have more than ${MAX_NOTE_COUNT} notes!`);
    }
  };

  const addNote = (noteName: string) => {
    validateNoteName(noteName);

    const allNotes = [noteName, ...state.allNotes];
    syncAllNotes(allNotes);
  };

  const deleteNotes = (noteNames: string[]) => {
    let allNotes = state.allNotes.filter((n) => !noteNames.includes(n));

    let newCurNote = null;
    if (allNotes.length > 0) {
      if (state.curNote && noteNames.includes(state.curNote)) {
        newCurNote = allNotes[0];
      } else {
        newCurNote = state.curNote;
      }
    } else {
      newCurNote = DEFAULT_NOTE_NAME;
      allNotes = [DEFAULT_NOTE_NAME];
    }

    chromeApi.removeNotes(noteNames);
    syncBaseAppState({ allNotes, curNote: newCurNote });
  };

  const getNoteData = (noteName: string, callback: (data: string) => void) => {
    chromeApi.getNote(noteName, callback);
  };

  const getInitialData = () => {
    chromeApi.getInitialNoteData((data) => {
      let allNotes = data.allNotes;
      let curNote = data.curNote;

      if (!data.allNotes || !data.curNote) {
        allNotes = data.allNotes || [DEFAULT_NOTE_NAME];
        curNote =
          data.curNote || data.allNotes ? data.allNotes[0] : DEFAULT_NOTE_NAME;

        chromeApi.setBaseAppState({
          allNotes,
          curNote,
        });
      }

      getNoteData(curNote, (note) => {
        setAppState({
          allNotes,
          curNote,
          noteContent: note || "",
        });
      });
    });
  };

  return useMemo(
    () => ({
      allNotes: state.allNotes,
      curNote: state.curNote,
      noteContent: state.noteContent,
      syncAllNotes,
      syncCurNote,
      syncNoteContent,
      setNoteContent,
      addNote,
      deleteNotes,
      getNoteData,
    }),
    [state]
  );
};
