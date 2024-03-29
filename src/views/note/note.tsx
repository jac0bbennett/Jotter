import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useLongPress } from "use-long-press";
import LinkPopup from "../../components/linkPopup";
import { LinkInfo, Themes } from "../../types";
import { Views } from "../../types";
import { NotesState } from "../../hooks/useNotes";
import { ThemeState } from "../../hooks/useTheme";
import StyleButtons from "../../components/styleButtons";

interface NoteProps {
  notesState: NotesState;
  setView: Dispatch<SetStateAction<Views>>;
  theme: ThemeState;
}

const Note = (props: NoteProps) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkInfo, setLinkInfo] = useState<LinkInfo>({
    top: 0,
    url: "",
    text: "",
    target: null,
  });

  const [typeTimeout, setTypeTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { theme, setTheme } = props.theme;

  const notepad = useRef<HTMLInputElement>(null);
  const linkPopup = useRef<HTMLDivElement>(null);

  const bind = useLongPress(
    () => {
      if (theme && (theme === "alt" || theme === "jonah")) {
        setTheme(Themes.DEFAULT);
      } else {
        setTheme(Themes.ALT);
      }
    },
    { threshold: 2000 }
  );

  const bindSecret = useLongPress(
    () => {
      if (charCount === 69) {
        setTheme(Themes.JONAH);
      }
    },
    { threshold: 2000 }
  );

  useEffect(() => {
    countWords(notepad.current?.textContent ?? "");
  }, [props.notesState.noteContent]);

  useEffect(() => {
    notepad.current?.focus();
  }, [props.notesState.curNote]);

  const save = (v: string, callback?: () => void) => {
    setSaving(false);
    props.notesState.syncNoteContent(v, (error?: Error) => {
      callback?.();
      setErrorMsg(error?.message ?? null);
    });
  };

  const countWords = (v = "") => {
    const newWordCount = v
      .replace(/[\u00A0\u2007\u202F\u2060\u3000]/g, " ")
      .trim()
      .split(/\s+/).length;
    setWordCount(notepad.current?.textContent ? newWordCount : 0);
    setCharCount(notepad.current?.textContent?.length ?? 0);
  };

  const handleNoteChange = (value: string) => {
    setSaving(true);
    setErrorMsg(null);
    if (typeTimeout) {
      clearTimeout(typeTimeout);
    }
    try {
      props.notesState.setNoteContent(value);
      setTypeTimeout(setTimeout(() => save(value), 650));
    } catch (e) {
      setErrorMsg((e as Error).message);
    }
  };

  const handleNotepadChange = (event: ContentEditableEvent) =>
    handleNoteChange(event.target.value);

  const exit = () => {
    window.close();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    let txt = e.clipboardData.getData("text/plain");

    const urlRegex = /((https?:\/\/)|(www\.))[^\s]+/g;
    const urls = txt.match(urlRegex);
    if (urls) {
      const urlSet = new Set(urls);
      urlSet.forEach((url) => {
        const href = url.startsWith("http") ? url : `http://${url}`;
        txt = txt.replaceAll(url, `<a href="${href}">${url}</a>`);
      });
    }

    document.execCommand("insertHtml", false, txt);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLElement>) => {
    setShowLinkPopup(false);
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  };

  return (
    <>
      <div className="menubar">
        <i
          className="material-icons loader"
          style={!saving ? { opacity: "0" } : undefined}
        >
          autorenew
        </i>
        <div
          data-testid="logo"
          className="header logo"
          style={
            saving ? { opacity: 0.8, transform: "translateX(24px)" } : undefined
          }
          {...bind()}
        >
          {theme !== Themes.JONAH ? "Jotter" : "Joner"}
        </div>
        <StyleButtons
          notepad={notepad}
          setShowLinkPopup={setShowLinkPopup}
          setLinkInfo={setLinkInfo}
        />
        <i
          className="material-icons"
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={() => props.setView(Views.ALLNOTES)}
          title="View All Notes"
          data-testid="view-all-notes"
        >
          source
        </i>
        <i
          className="material-icons"
          onClick={() => save(props.notesState.noteContent, exit)}
          style={{ cursor: "pointer" }}
          title="Exit"
          data-testid="exit"
        >
          clear
        </i>
      </div>
      {showLinkPopup ? (
        <LinkPopup
          linkInfo={linkInfo}
          setLinkInfo={setLinkInfo}
          setNote={handleNoteChange}
          setShowLinkPopup={setShowLinkPopup}
          notepadRef={notepad}
          ref={linkPopup}
        />
      ) : null}
      <ContentEditable
        data-testid="notepad"
        className="notepad leading-tight"
        html={props.notesState.noteContent}
        innerRef={notepad}
        onChange={handleNotepadChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyPress}
      ></ContentEditable>
      {errorMsg ? (
        <div style={{ color: "red" }} data-testid="error-msg">
          {errorMsg}
        </div>
      ) : null}
      <div className="infobar">
        <div
          className="charcount"
          title="Character Count"
          data-testid="char-count"
          {...bindSecret()}
        >
          {charCount}
        </div>
        <div className="wordcount" title="Word Count" data-testid="word-count">
          {wordCount}
        </div>
        <div
          data-testid="current-note-name"
          className="notename"
          title="Note name"
        >
          {props.notesState.curNote}
        </div>
      </div>
    </>
  );
};

export default Note;
