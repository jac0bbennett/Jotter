/*global chrome*/
import "./App.css";
import "./alt.css";
import { useState, useEffect } from "react";
import Note from "./views/note";
import AllNotes from "./views/allnotes";
import { views } from "./utils";

const App = () => {
  const [view, setView] = useState(views.NOTE);
  const [curNote, setCurNote] = useState(null);

  useEffect(() => {
    chrome.storage.sync.get("curNote", cur => {
      if (cur["curNote"]) {
        setCurNote(cur["curNote"]);
      } else {
        setCurNote("main");
        chrome.storage.sync.set({ curNote: "main" });
      }
    });
  }, []);

  return (
    <div className="app">
      <Note setView={setView} curNote={curNote} />
      <div
        className="allnotescont"
        style={view === views.ALLNOTES ? { top: "0px" } : null}
      >
        <AllNotes setView={setView} curNote={curNote} setCurNote={setCurNote} />
      </div>
    </div>
  );
};

export default App;
