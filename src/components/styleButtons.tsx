import { useCallback, useEffect, useReducer, useRef } from "react";
import { styleReducer } from "../reducers/style";
import { LinkInfo } from "../types";

type StyleButtonsProps = {
  notepad: React.RefObject<HTMLDivElement>;
  setShowLinkPopup: React.Dispatch<React.SetStateAction<boolean>>;
  setLinkInfo: React.Dispatch<React.SetStateAction<LinkInfo>>;
};

const StyleButtons = (props: StyleButtonsProps) => {
  const stylebuttons = useRef<HTMLDivElement>(null);

  const { notepad, setShowLinkPopup, setLinkInfo } = props;

  const [styleState, dispatchStyle] = useReducer(styleReducer, {
    bolded: false,
    italic: false,
    underlined: false,
  });

  const stylize = (command: string) => {
    const selection = document.getSelection();
    if (!selection || !props.notepad.current) return;
    document.execCommand(command);
    props.notepad.current.focus();
    checkStyle();
  };

  const createLink = () => {
    const selection = document.getSelection();
    if (!selection || !props.notepad.current) return;

    let selectionText = selection.toString().trim();

    if (selectionText) {
      if (selection && !selectionText.startsWith("http")) {
        selectionText = "http://" + selectionText;
      }
      document.execCommand("createLink", false, selectionText);
    } else {
      props.setLinkInfo({
        top: 50,
        documentRange: selection.getRangeAt(0),
      });
      props.setShowLinkPopup(true);
    }
  };

  const checkStyle = useCallback(() => {
    const newStyle = { ...styleState };
    if (document.queryCommandValue("Bold") === "true") {
      newStyle.bolded = true;
    } else {
      newStyle.bolded = false;
    }
    if (document.queryCommandValue("Italic") === "true") {
      newStyle.italic = true;
    } else {
      newStyle.italic = false;
    }
    if (document.queryCommandValue("Underline") === "true") {
      newStyle.underlined = true;
    } else {
      newStyle.underlined = false;
    }
    dispatchStyle({ type: "set", payload: newStyle });
  }, [styleState]);

  useEffect(() => {
    const clickEventListner = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (
        notepad.current &&
        notepad.current.contains(e.target) &&
        e.target instanceof HTMLAnchorElement
      ) {
        const linkRect = e.target.getBoundingClientRect();
        setLinkInfo({
          top: Math.max(linkRect.top - 30, 10),
          url: e.target.getAttribute("href") ?? "",
          text: e.target.textContent ?? "",
          target: e.target,
        });
        setShowLinkPopup(true);
        checkStyle();
      } else if (
        (notepad.current && notepad.current.contains(e.target)) ||
        stylebuttons.current?.contains(e.target)
      ) {
        checkStyle();
      } else {
        dispatchStyle({ type: "setAll", payload: false });
      }
    };

    document.addEventListener("click", clickEventListner);
    return () => document.removeEventListener("click", clickEventListner);
  }, [checkStyle, notepad, setLinkInfo, setShowLinkPopup]);

  return (
    <div className="stylingoptions flex items-center" ref={stylebuttons}>
      <button
        style={{ fontWeight: "bold" }}
        onClick={() => {
          dispatchStyle({ type: "bold", payload: !styleState.bolded });
          stylize("bold");
        }}
        className={styleState.bolded ? "activestyle" : undefined}
        title="Bold"
      >
        B
      </button>
      <button
        style={{ fontStyle: "italic" }}
        onClick={() => {
          dispatchStyle({ type: "italic", payload: !styleState.italic });
          stylize("italic");
        }}
        className={styleState.italic ? "activestyle" : undefined}
        title="Italic"
      >
        I
      </button>
      <button
        style={{ textDecoration: "underline" }}
        onClick={() => {
          dispatchStyle({
            type: "underline",
            payload: !styleState.underlined,
          });
          stylize("underline");
        }}
        className={styleState.underlined ? "activestyle" : undefined}
        title="Underline"
      >
        U
      </button>
      <button
        onClick={() => {
          createLink();
        }}
        // eslint-disable-next-line no-constant-condition
        className={false ? "activestyle" : undefined}
        title="Create link"
      >
        <i className="material-icons" data-testid="create-link">
          link
        </i>
      </button>
    </div>
  );
};

export default StyleButtons;
