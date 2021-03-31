/*global chrome*/
import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import { views } from "../utils";
import { useLongPress } from "use-long-press";

const Note = props => {
  const [note, setNote] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [bolded, setBolded] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underlined, setUnderlined] = useState(false);

  const [typeTimeout, setTypeTimeout] = useState(null);

  const notepad = useRef();
  const stylebuttons = useRef();

  const setTheme = (b = "default") => {
    if (b === "alt") {
      chrome.storage.local.set({ theme: "alt" });
      document.body.setAttribute("data-theme", "alt");
      chrome.browserAction.setIcon({ path: "icon48alt.png" });
    } else {
      chrome.storage.local.set({ theme: null });
      document.body.setAttribute("data-theme", "default");
      chrome.browserAction.setIcon({ path: "icon48.png" });
    }
  };

  const bind = useLongPress(
    () => {
      chrome.storage.local.get(["theme"], obj => {
        if (obj.theme && obj.theme === "alt") {
          setTheme("default");
        } else {
          setTheme("alt");
        }
      });
    },
    { threshold: 2000 }
  );

  useEffect(() => {
    chrome.storage.local.get("theme", obj => {
      if (obj.theme && obj.theme === "alt") {
        setTheme("alt");
      } else {
        setTheme("default");
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(props.curNote, obj => {
      setNote(obj[props.curNote] || "");
      countWords(obj[props.curNote]);
      setErrorMsg(null);
    });
  }, [props.curNote]);

  const save = v => {
    setSaving(false);
    chrome.storage.sync.set({ [props.curNote]: v }, () => {
      if (chrome.runtime.lastError) {
        setErrorMsg(
          "Failed to Save! Total data may be exceeding Chrome limits!"
        );
      }
    });
    setErrorMsg(null);
  };

  const countWords = (v = "") => {
    const breaks = v.split("<div>").length - 1;
    const words = v.split(" ").length;
    setWordCount(notepad.current.textContent ? words + breaks : 0);
    setCharCount(notepad.current.textContent.length);
  };

  const handleNotepadChange = event => {
    countWords(event.target.value);
    if (event.target.value.length < 8192) {
      setNote(event.target.value);
      setSaving(true);
      setErrorMsg(null);
      if (typeTimeout) {
        clearTimeout(typeTimeout);
      }
      setTypeTimeout(setTimeout(() => save(event.target.value), 650));
    } else {
      setErrorMsg("Note exceeding max length! Cannot save!");
    }
  };

  const stylize = command => {
    const selection = document.getSelection();
    notepad.current.textContent.replace(
      selection,
      document.execCommand(command)
    );
    notepad.current.focus();
    checkStyle();
  };

  const exit = () => {
    save();
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
    document.addEventListener("click", e => {
      if (
        (notepad.current && notepad.current.contains(e.target)) ||
        stylebuttons.current.contains(e.target)
      ) {
        checkStyle();
      } else if (notepad.current && !notepad.current.contains(e.target)) {
        setBolded(false);
        setItalic(false);
        setUnderlined(false);
      }
    });
    return () => document.removeEventListener("click");
  }, []);

  const handlePaste = e => {
    e.preventDefault();
    const txt = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertHtml", false, txt);
  };

  const handleKeyPress = e => {
    if (e.keyCode === 9) {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  };

  return (
    <React.Fragment>
      <div className="menubar">
        <i
          className="material-icons loader"
          style={!saving ? { opacity: "0" } : null}
        >
          autorenew
        </i>
        <div
          className="header logo"
          style={
            saving ? { opacity: 0.8, transform: "translateX(24px)" } : null
          }
          {...bind}
        >
          Jotter
        </div>
        <div className="stylingoptions" ref={stylebuttons}>
          <button
            style={{ fontWeight: "bold" }}
            onClick={() => {
              setBolded(!bolded);
              stylize("bold");
            }}
            className={bolded ? "activestyle" : null}
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
            className={italic ? "activestyle" : null}
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
            className={underlined ? "activestyle" : null}
            title="Underline"
          >
            U
          </button>
        </div>
        <i
          className="material-icons"
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={() => props.setView(views.ALLNOTES)}
          title="View All Notes"
        >
          source
        </i>
        <i
          className="material-icons"
          onClick={exit}
          style={{ cursor: "pointer" }}
          title="Exit"
        >
          clear
        </i>
      </div>
      <ContentEditable
        className="notepad"
        html={note}
        innerRef={notepad}
        onChange={handleNotepadChange}
        onKeyUp={checkStyle}
        onKeyDown={handleKeyPress}
        onPaste={handlePaste}
      ></ContentEditable>
      {errorMsg ? <div style={{ color: "red" }}>{errorMsg}</div> : null}
      <div className="infobar">
        <div className="charcount" title="Character Count">
          {charCount}
        </div>
        <div className="wordcount" title="Word Count">
          {wordCount}
        </div>
        <div className="notename" title="Note name">
          {props.curNote}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Note;
