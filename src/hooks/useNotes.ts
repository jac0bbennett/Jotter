import { useEffect, useReducer } from "react";
import {
  DEFAULT_NOTE_NAME,
  InitialNoteData,
  MAX_NOTE_COUNT,
  MAX_TITLE_LENGTH,
  PROHIBITED_NOTE_NAMES
} from "../types";
import * as chromeApi from "../api/chrome";

type State = InitialNoteData & {
  noteContent: string;
};

type Action =
  | {
      type: "setAllNotes" | "setCurNote" | "setNoteContent";
      payload: string[];
    }
  | {
      type: "setAppState";
      payload: InitialNoteData;
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
  setAllNotes: (allNotes: string[]) => void;
  setCurNote: (curNote: string) => void;
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
    default:
      return state;
  }
};

export const useNotes = (): NotesState => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getInitialData();
  }, []);

  const setAppState = (newState: InitialNoteData) => {
    chromeApi.setAppState(newState);
    dispatch({ type: "setAppState", payload: newState });
  };

  const setAllNotes = (allNotes: string[]) => {
    chromeApi.setAllNotes(allNotes);
    dispatch({ type: "setAllNotes", payload: allNotes });
  };

  const setCurNote = (curNote: string) => {
    if (curNote === null) return;
    chromeApi.getNote(curNote, note => {
      setNoteContent(note || "");
    });
    chromeApi.setCurrentNote(curNote);
    dispatch({ type: "setCurNote", payload: [curNote] });
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
    setAllNotes(allNotes);
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
    setAppState({ allNotes, curNote: newCurNote });
  };

  const getNoteData = (noteName: string, callback: (data: string) => void) => {
    chromeApi.getNote(noteName, callback);
  };

  const getInitialData = () => {
    chromeApi.getInitialNoteData(data => {
      let allNotes = data.allNotes || [DEFAULT_NOTE_NAME];
      let curNote = data.curNote || DEFAULT_NOTE_NAME;

      dispatch({
        type: "setAppState",
        payload: { allNotes: allNotes, curNote: curNote }
      });

      if (data.curNote) {
        chromeApi.getNote(data.curNote, note => {
          dispatch({ type: "setNoteContent", payload: [note || ""] });
        });
      }
    });
  };

  return {
    allNotes: state.allNotes,
    curNote: state.curNote,
    noteContent: state.noteContent,
    setAllNotes,
    setCurNote,
    setNoteContent,
    addNote,
    deleteNotes,
    getNoteData
  };
};
