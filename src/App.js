import "./App.css";
import { useState } from "react";
import Note from "./views/note";
import AllNotes from "./views/allnotes";
import { views } from "./utils";

const App = () => {
  const [view, setView] = useState(views.NOTE);

  return (
    <div className="app">
      <Note setView={setView} />
      <div
        className="allnotescont"
        style={view === views.ALLNOTES ? { top: "0px" } : null}
      >
        <AllNotes setView={setView} />
      </div>
    </div>
  );
};

export default App;
