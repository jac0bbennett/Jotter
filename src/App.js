/*global chrome*/
import "./App.css";
import "./alt.css";
import "./jonah.css";
import { useState, useEffect } from "react";
import Note from "./views/note";
import AllNotes from "./views/allnotes";
import { views } from "./utils";

const App = () => {
  const [view, setView] = useState(views.NOTE);
  const [curNote, setCurNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    chrome.storage.sync.get("curNote", cur => {
      if (cur["curNote"]) {
        setCurNote(cur["curNote"]);
      } else {
        setCurNote("main");
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(curNote, obj => {
      setNoteContent(obj[curNote] || "");
    });
  }, [curNote]);

  return (
    <div className="app">
      <Note
        setView={setView}
        curNote={curNote}
        note={noteContent}
        setNote={setNoteContent}
      />
      <div
        className="allnotescont"
        style={view === views.ALLNOTES ? { top: "0px" } : null}
      >
        <AllNotes
          setView={setView}
          curNote={curNote}
          setCurNote={setCurNote}
          setNote={setNoteContent}
        />
      </div>
    </div>
  );
};

export default App;
