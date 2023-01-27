import "./App.css";
import "./alt.css";
import "./jonah.css";
import { useState, useEffect } from "react";
import Note from "./views/note/note";
import AllNotes from "./views/allnotes";
import { Views } from "./interfaces";

const App = () => {
  const [view, setView] = useState(Views.NOTE);
  const [curNote, setCurNote] = useState<string | null>(null);
  const [noteNames, setNoteNames] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["curNote", "allNotes"], cur => {
      if (cur["curNote"]) {
        setCurNote(cur["curNote"]);
      } else {
        setCurNote("main");
        chrome.storage.sync.set({ curNote: "main" });
      }
      if (cur["allNotes"]) {
        setNoteNames(cur["allNotes"]);
      } else {
        setNoteNames(["main"]);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(curNote, obj => {
      if (curNote === null) return;
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
        style={view === Views.ALLNOTES ? { top: "0px" } : undefined}
      >
        <AllNotes
          setView={setView}
          curNote={curNote}
          setCurNote={setCurNote}
          setNote={setNoteContent}
          noteNames={noteNames}
          setNoteNames={setNoteNames}
        />
      </div>
    </div>
  );
};

export default App;
