import React, { useState } from "react";
import { views } from "../utils";

const AllNotes = props => {
  const [noteNames, setNoteNames] = useState(["Main", "Test"]);
  const [newNote, setNewNote] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [msg, setMsg] = useState(null);

  const newNoteChange = e => {
    setNewNote(e.target.value);
    setMsg(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!newNote || newNote === "") {
      setMsg("Name can't be blank!");
    } else if (noteNames.includes(newNote)) {
      setMsg("Name must be unique!");
    } else if (newNote.length > 40) {
      setMsg("Name too long! (<=40)");
    } else {
      setNoteNames([newNote, ...noteNames]);
      setNewNote("");
    }
  };

  const selectNote = name => {
    props.setView(views.NOTE);
  };

  const removeNote = name => {
    setNoteNames(noteNames.filter(n => n !== name));
  };

  const close = () => {
    setDeleteMode(false);
    props.setView(views.NOTE);
  };

  return (
    <React.Fragment>
      <div className="menubar">
        <div className="header">All Notes</div>
        <i
          className="material-icons"
          style={{ marginLeft: "10px", marginRight: "10px", cursor: "pointer" }}
          title="Remove notes"
          onClick={() => setDeleteMode(!deleteMode)}
        >
          {!deleteMode ? "remove_circle_outline" : "remove_circle"}
        </i>
        <div className="notelistmode">{deleteMode ? "Delete Mode" : null}</div>
        <i
          className="material-icons"
          style={{ fontSize: "28px", cursor: "pointer", marginLeft: "auto" }}
          onClick={close}
          title="Close"
        >
          keyboard_arrow_down
        </i>
      </div>
      <div className="newnote">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Note Name"
            value={newNote}
            onChange={newNoteChange}
          ></input>
          <button type="submit">Create</button>
        </form>
      </div>
      {msg ? <div className="newnotemsg">{msg}</div> : null}
      <div className={!deleteMode ? "notelist" : "notelist deleting"}>
        {noteNames.map(name => (
          <div
            key={name}
            onClick={
              !deleteMode ? () => selectNote(name) : () => removeNote(name)
            }
          >
            {name}
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

export default AllNotes;
