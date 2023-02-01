type styleActions =
  | {
      type: "bold";
      payload: boolean;
    }
  | {
      type: "italic";
      payload: boolean;
    }
  | {
      type: "underline";
      payload: boolean;
    }
  | {
      type: "setAll";
      payload: boolean;
    }
  | { type: "set"; payload: styleState };

type styleState = {
  bolded: boolean;
  italic: boolean;
  underlined: boolean;
};

export const styleReducer = (state: styleState, action: styleActions) => {
  switch (action.type) {
    case "bold":
      return { ...state, bolded: !state.bolded };
    case "italic":
      return { ...state, italic: !state.italic };
    case "underline":
      return { ...state, underlined: !state.underlined };
    case "set":
      return { ...action.payload };
    case "setAll":
      return {
        bolded: action.payload,
        italic: action.payload,
        underlined: action.payload,
      };
    default:
      return state;
  }
};
