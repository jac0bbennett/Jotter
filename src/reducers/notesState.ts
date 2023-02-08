import { BaseAppState } from "../types";

export type NotesReducerState = BaseAppState & {
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
      payload: NotesReducerState;
    };

export const notesStateReducer = (state: NotesReducerState, action: Action) => {
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
