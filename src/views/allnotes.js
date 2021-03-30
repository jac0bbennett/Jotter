/*global chrome*/
import React, { useState, useEffect } from "react";
import { views } from "../utils";

const AllNotes = props => {
  const [noteNames, setNoteNames] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    chrome.storage.sync.get("allNotes", obj => {
      const allNotes = obj.allNotes;
      if (allNotes) {
        setNoteNames(allNotes);
      } else {
        chrome.storage.sync.set({ allNotes: ["main"] });
        setNoteNames(["main"]);
      }
    });
  }, []);

  const newNoteChange = e => {
    setNewNote(e.target.value);
    setMsg(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (newNote !== "allNotes") {
      if (!newNote) {
        setMsg("Name can't be blank!");
      } else if (noteNames.includes(newNote)) {
        setMsg("Name must be unique!");
      } else if (newNote.length > 40) {
        setMsg("Name too long! (<=40)");
      } else if (noteNames.length >= 400) {
        setMsg("Cannot have more than 400 notes!");
      } else {
        const allNotes = [newNote, ...noteNames];
        setNoteNames(allNotes);
        chrome.storage.sync.set({ allNotes });
        setNewNote("");
      }
    } else {
      setMsg("Invalid note name!");
    }
  };

  const selectNote = name => {
    chrome.storage.sync.set({ curNote: name });
    props.setView(views.NOTE);
    props.setCurNote(name);
  };

  const removeNote = name => {
    const allNotes = noteNames.filter(n => n !== name);
    setNoteNames(allNotes);
    let newCurNote = null;
    if (allNotes.length > 0) {
      if (props.curNote === name) {
        newCurNote = allNotes[0];
      } else {
        newCurNote = props.curNote;
      }
    }
    chrome.storage.sync.set({ allNotes: allNotes, curNote: newCurNote });
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
            placeholder="New Note Name"
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
