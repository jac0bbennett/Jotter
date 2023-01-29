import "./App.css";
import "./alt.css";
import "./jonah.css";
import { useState } from "react";
import Note from "./views/note/note";
import AllNotes from "./views/allnotes";
import { DEFAULT_NOTE_NAME, Views } from "./types";
import { useNotes } from "./hooks/useNotes";

const App = () => {
  const [view, setView] = useState(Views.NOTE);
  const notesState = useNotes();

  return (
    <div className="app">
      <Note setView={setView} notesState={notesState} />
      <div
        className="allnotescont"
        style={view === Views.ALLNOTES ? { top: "0px" } : undefined}
      >
        <AllNotes setView={setView} notesState={notesState} />
      </div>
    </div>
  );
};

export default App;
