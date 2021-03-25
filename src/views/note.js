import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import { views } from "../utils";

const Note = props => {
  const [note, setNote] = useState("");
  const [noteName, setNoteName] = useState("Thoughts");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const [bolded, setBolded] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underlined, setUnderlined] = useState(false);

  const [typeTimeout, setTypeTimeout] = useState(null);

  const notepad = useRef();

  const save = () => {
    setSaving(false);
  };

  const countWords = v => {
    const breaks = v.split("<div>").length - 1;
    const words = v.split(" ").length;
    setWordCount(notepad.current.textContent ? words + breaks : 0);
    setCharCount(notepad.current.textContent.length);
  };

  const handleNotepadChange = event => {
    setNote(event.target.value);
    countWords(event.target.value);
    setSaving(true);
    if (typeTimeout) {
      clearTimeout(typeTimeout);
    }
    setTypeTimeout(setTimeout(save, 650));
  };

  const stylize = command => {
    const selection = document.getSelection();
    notepad.current.textContent.replace(
      selection,
      document.execCommand(command)
    );
    notepad.current.focus();
  };

  const exit = () => {
    save();
    window.close();
  };

  useEffect(() => {
    const styleInterval = setInterval(() => {
      if (!bolded && document.queryCommandValue("Bold") === "true") {
        setBolded(true);
      } else if (bolded && document.queryCommandValue("Bold") === "false") {
        setBolded(false);
      }

      if (!italic && document.queryCommandValue("Italic") === "true") {
        setItalic(true);
      } else if (italic && document.queryCommandValue("Italic") === "false") {
        setItalic(false);
      }

      if (!underlined && document.queryCommandValue("Underline") === "true") {
        setUnderlined(true);
      } else if (
        underlined &&
        document.queryCommandValue("Underline") === "false"
      ) {
        setUnderlined(false);
      }
    }, 100);

    return () => clearInterval(styleInterval);
  }, [bolded, italic, underlined]);

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
        >
          Jotter
        </div>
        <div className="stylingoptions">
          <button
            style={{ fontWeight: "bold" }}
            onClick={() => stylize("bold")}
            className={bolded ? "activestyle" : null}
            title="Bold"
          >
            B
          </button>
          <button
            style={{ fontStyle: "italic" }}
            onClick={() => stylize("italic")}
            className={italic ? "activestyle" : null}
            title="Italic"
          >
            I
          </button>
          <button
            style={{ textDecoration: "underline" }}
            onClick={() => stylize("underline")}
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
          title="View all Notes"
        >
          notes
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
      ></ContentEditable>
      <div className="infobar">
        <div className="charcount" title="Character Count">
          {charCount}
        </div>
        <div className="wordcount" title="Word Count">
          {wordCount}
        </div>
        <div className="notename" title="Note name">
          {noteName}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Note;
