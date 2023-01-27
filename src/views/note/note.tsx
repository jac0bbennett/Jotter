import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  useEffect,
  KeyboardEvent
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useLongPress } from "use-long-press";
import LinkPopup from "./linkPopup";
import { LinkInfo } from "../../interfaces";
import { Views } from "../../interfaces";

interface NoteProps {
  setView: Dispatch<SetStateAction<Views>>;
  curNote: string | null;
  note: string;
  setNote: (note: string) => void;
}

const Note = (props: NoteProps) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [bolded, setBolded] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underlined, setUnderlined] = useState(false);

  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkInfo, setLinkInfo] = useState<LinkInfo>({
    top: 0,
    url: "",
    target: null
  });

  const [typeTimeout, setTypeTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [header, setHeader] = useState("Jotter");

  const notepad = useRef<HTMLInputElement>(null);
  const linkPopup = useRef<HTMLDivElement>(null);
  const stylebuttons = useRef<HTMLDivElement>(null);

  const setTheme = (b = "default") => {
    if (b === "alt") {
      chrome.storage.local.set({ theme: "alt" });
      document.body.setAttribute("data-theme", "alt");
      chrome.action.setIcon({ path: "icon48alt.png" });
      setHeader("Jotter");
    } else if (b === "jonah") {
      chrome.storage.local.set({ theme: "jonah" });
      document.body.setAttribute("data-theme", "jonah");
      chrome.action.setIcon({ path: "icon48jonah.png" });
      setHeader("Joner");
    } else {
      chrome.storage.local.set({ theme: null });
      document.body.setAttribute("data-theme", "default");
      chrome.action.setIcon({ path: "icon48.png" });
      setHeader("Jotter");
    }
  };

  const bind = useLongPress(
    () => {
      chrome.storage.local.get(["theme"], obj => {
        if (obj.theme && (obj.theme === "alt" || obj.theme === "jonah")) {
          setTheme("default");
        } else {
          setTheme("alt");
        }
      });
    },
    { threshold: 2000 }
  );

  const bindSecret = useLongPress(
    () => {
      if (charCount === 69) {
        chrome.storage.local.get(["theme"], obj => {
          setTheme("jonah");
        });
      }
    },
    { threshold: 2000 }
  );

  useEffect(() => {
    chrome.storage.local.get("theme", obj => {
      if (obj.theme && obj.theme === "alt") {
        setTheme("alt");
      } else if (obj.theme && obj.theme === "jonah") {
        setTheme("jonah");
      } else {
        setTheme("default");
      }
    });
  }, []);

  useEffect(() => {
    countWords(notepad.current?.innerText);
  }, [props.note]);

  useEffect(() => {
    notepad.current?.focus();
  }, [props.curNote]);

  const save = (v: string, callback?: () => void) => {
    setSaving(false);
    chrome.storage.sync.set({ [props.curNote!]: v }, () => {
      if (chrome.runtime.lastError) {
        setErrorMsg(
          "Failed to Save! Total data may be exceeding Chrome limits!"
        );
      } else {
        if (callback) callback();
      }
    });
    setErrorMsg(null);
  };

  const countWords = (v = "") => {
    const wordCount = v.replaceAll("\n", " ").trim().split(/[ ]+/).length;
    setWordCount(notepad.current?.textContent ? wordCount : 0);
    setCharCount(notepad.current?.textContent?.length ?? 0);
  };

  const handleNoteChange = (value: string) => {
    props.setNote(value);
    if (value.length < 8192) {
      setSaving(true);
      setErrorMsg(null);
      if (typeTimeout) {
        clearTimeout(typeTimeout);
      }
      setTypeTimeout(setTimeout(() => save(value), 650));
    } else {
      setErrorMsg("Note exceeding max length! Cannot save!");
    }
  };

  const handleNotepadChange = (event: ContentEditableEvent) =>
    handleNoteChange(event.target.value);

  const stylize = (command: string) => {
    const selection = document.getSelection();
    if (!selection || !notepad.current) return;
    document.execCommand(command);
    notepad.current.focus();
    checkStyle();
  };

  const createLink = () => {
    const selection = document.getSelection();
    if (!selection || !notepad.current) return;

    let selectionText = selection.toString();

    if (selectionText !== "") {
      if (selection && !selectionText.startsWith("http")) {
        selectionText = "http://" + selectionText;
      }
      document.execCommand("createLink", false, selectionText);
    }
    notepad.current.focus();
  };

  const exit = () => {
    window.close();
  };

  const checkStyle = () => {
    if (document.queryCommandValue("Bold") === "true") {
      setBolded(true);
    } else {
      setBolded(false);
    }
    if (document.queryCommandValue("Italic") === "true") {
      setItalic(true);
    } else {
      setItalic(false);
    }
    if (document.queryCommandValue("Underline") === "true") {
      setUnderlined(true);
    } else {
      setUnderlined(false);
    }
  };

  useEffect(() => {
    const clickEventListner = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (
        notepad.current &&
        notepad.current.contains(e.target) &&
        e.target instanceof HTMLAnchorElement
      ) {
        setShowLinkPopup(true);
        const linkRect = e.target.getBoundingClientRect();
        setLinkInfo({
          top: linkRect.top - 30,
          url: e.target.getAttribute("href") ?? "",
          target: e.target
        });
        setBolded(false);
        setItalic(false);
        setUnderlined(false);
      } else if (linkPopup.current && linkPopup.current.contains(e.target)) {
        setShowLinkPopup(true);
      } else if (
        (notepad.current && notepad.current.contains(e.target)) ||
        stylebuttons.current?.contains(e.target)
      ) {
        checkStyle();
        setShowLinkPopup(false);
      } else {
        setBolded(false);
        setItalic(false);
        setUnderlined(false);
        setShowLinkPopup(false);
      }
    };

    document.addEventListener("click", clickEventListner);
    return () => document.removeEventListener("click", clickEventListner);
  }, []);

  const handlePaste = (e: any) => {
    e.preventDefault();
    const txt = (e.originalEvent || e).clipboardData.getData("text/plain");
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
          className="header logo"
          style={
            saving ? { opacity: 0.8, transform: "translateX(24px)" } : undefined
          }
          {...bind()}
        >
          {header}
        </div>
        <div className="stylingoptions" ref={stylebuttons}>
          <button
            style={{ fontWeight: "bold" }}
            onClick={() => {
              setBolded(!bolded);
              stylize("bold");
            }}
            className={bolded ? "activestyle" : undefined}
            title="Bold"
          >
            B
          </button>
          <button
            style={{ fontStyle: "italic" }}
            onClick={() => {
              setItalic(!italic);
              stylize("italic");
            }}
            className={italic ? "activestyle" : undefined}
            title="Italic"
          >
            I
          </button>
          <button
            style={{ textDecoration: "underline" }}
            onClick={() => {
              setUnderlined(!underlined);
              stylize("underline");
            }}
            className={underlined ? "activestyle" : undefined}
            title="Underline"
          >
            U
          </button>
          <button
            onClick={() => {
              createLink();
            }}
            className={false ? "activestyle" : undefined}
            title="Create link"
          >
            <i
              className="material-icons"
              style={{ fontSize: "19px", paddingTop: "1px" }}
            >
              link
            </i>
          </button>
        </div>
        <i
          className="material-icons"
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={() => props.setView(Views.ALLNOTES)}
          title="View All Notes"
        >
          source
        </i>
        <i
          className="material-icons"
          onClick={() => save(props.note, exit)}
          style={{ cursor: "pointer" }}
          title="Exit"
        >
          clear
        </i>
      </div>
      {showLinkPopup ? (
        <LinkPopup
          linkInfo={linkInfo}
          setLinkInfo={setLinkInfo}
          setNote={handleNoteChange}
          notepadRef={notepad}
          ref={linkPopup}
        />
      ) : null}
      <ContentEditable
        className="notepad"
        html={props.note}
        innerRef={notepad}
        onChange={handleNotepadChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyPress}
      ></ContentEditable>
      {errorMsg ? <div style={{ color: "red" }}>{errorMsg}</div> : null}
      <div className="infobar">
        <div className="charcount" title="Character Count" {...bindSecret()}>
          {charCount}
        </div>
        <div className="wordcount" title="Word Count">
          {wordCount}
        </div>
        <div className="notename" title="Note name">
          {props.curNote}
        </div>
      </div>
    </>
  );
};

export default Note;
