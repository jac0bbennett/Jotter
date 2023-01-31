import { useEffect, useMemo, useReducer } from "react";
import {
  DEFAULT_NOTE_NAME,
  BaseAppState,
  MAX_NOTE_COUNT,
  MAX_TITLE_LENGTH,
  PROHIBITED_NOTE_NAMES
} from "../types";
import * as chromeApi from "../api/chrome";

type State = BaseAppState & {
  noteContent: string;
};

type Action =
  | {
      type: "setAllNotes" | "setCurNote" | "setNoteContent";
      payload: string[];
    }
  | {
      type: "setBaseAppState";
      payload: BaseAppState;
    }
  | {
      type: "setAppState";
      payload: State;
    };

const initialState: State = {
  allNotes: [],
  curNote: DEFAULT_NOTE_NAME,
  noteContent: ""
};

export type NotesState = {
  allNotes: string[];
  curNote: string;
  noteContent: string;
  syncAllNotes: (allNotes: string[]) => void;
  syncCurNote: (curNote: string) => void;
  syncNoteContent: (callback?: () => void) => void;
  setNoteContent: (noteContent: string) => void;
  deleteNotes: (notes: string[]) => void;
  addNote: (noteName: string) => void;
  getNoteData: (noteName: string, callback: (data: string) => void) => void;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "setAllNotes":
      return { ...state, allNotes: action.payload };
    case "setCurNote":
      return { ...state, curNote: action.payload[0] };
    case "setNoteContent":
      return { ...state, noteContent: action.payload[0] };
    case "setAppState":
      return { ...state, ...action.payload };
    case "setBaseAppState":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const useNotes = (): NotesState => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getInitialData();
  }, []);

  const setAppState = (newState: State) => {
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
    if (curNote === null) return;
    chromeApi.getNote(curNote, note => {
      setNoteContent(note || "");
    });
    chromeApi.setCurrentNote(curNote);
    dispatch({ type: "setCurNote", payload: [curNote] });
  };

  const syncNoteContent = (callback?: () => void) => {
    console.log(state);
    chromeApi.setNote(state.curNote, state.noteContent, () => {
      if (chrome.runtime.lastError) {
        throw new Error(
          "Failed to Save! Total data may be exceeding Chrome limits!"
        );
      } else {
        if (callback) callback();
      }
    });
  };

  const setNoteContent = (noteContent: string) => {
    dispatch({ type: "setNoteContent", payload: [noteContent] });
  };

  const addNote = (noteName: string) => {
    if (PROHIBITED_NOTE_NAMES.includes(noteName)) {
      throw new Error("Invalid note name!");
    } else if (!noteName) {
      throw new Error("Name can't be blank!");
    } else if (state.allNotes.includes(noteName)) {
      throw new Error("Name must be unique!");
    } else if (noteName.length > 40) {
      throw new Error(`Name too long! (<=${MAX_TITLE_LENGTH})`);
    } else if (state.allNotes.length >= MAX_NOTE_COUNT) {
      throw new Error(`Cannot have more than ${MAX_NOTE_COUNT} notes!`);
    }

    const allNotes = [noteName, ...state.allNotes];
    syncAllNotes(allNotes);
  };

  const deleteNotes = (noteNames: string[]) => {
    let allNotes = state.allNotes.filter(n => !noteNames.includes(n));

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
    chromeApi.getInitialNoteData(data => {
      let allNotes = data.allNotes;
      let curNote = data.curNote;

      if (!data.allNotes || !data.curNote) {
        allNotes = data.allNotes || [DEFAULT_NOTE_NAME];
        curNote = data.curNote || DEFAULT_NOTE_NAME;

        chromeApi.setBaseAppState({
          allNotes,
          curNote
        });
      }

      getNoteData(data.curNote, note => {
        setAppState({
          allNotes,
          curNote,
          noteContent: note || ""
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
      getNoteData
    }),
    [state]
  );
};
