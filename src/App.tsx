import "./App.css";
import "./alt.css";
import "./jonah.css";
import { useState } from "react";
import Note from "./views/note/note";
import AllNotes from "./views/allNotes";
import { Views } from "./types";
import { useNotes } from "./hooks/useNotes";
import { useTheme } from "./hooks/useTheme";

const App = () => {
  const [view, setView] = useState(Views.NOTE);
  const notesState = useNotes();

  const theme = useTheme();

  return (
    <div className="app">
      <Note setView={setView} notesState={notesState} theme={theme} />
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
