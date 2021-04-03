/*global chrome*/
import React, { useState, useEffect } from "react";
import { views } from "../utils";

const AllNotes = props => {
  const [noteNames, setNoteNames] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    chrome.storage.sync.get("allNotes", obj => {
      const allNotes = obj.allNotes;
      if (allNotes && allNotes.length > 0) {
        setNoteNames(allNotes);
      } else {
        chrome.storage.sync.set({ allNotes: ["main"] });
        setNoteNames(["main"]);
      }
      let undeleted = [];
      chrome.storage.sync.get(undefined, obj2 => {
        for (const n in obj2) {
          if (
            !allNotes ||
            (!allNotes.includes(n) && !["allNotes", "curNote"].includes(n))
          ) {
            undeleted.push(n);
          }
        }
        chrome.storage.sync.remove(undeleted);
      });
    });
  }, []);

  const newNoteChange = e => {
    setNewNote(e.target.value);
    setMsg(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!["allNotes", "curNote"].includes(newNote)) {
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

  const selectRemoveNote = name => {
    setSelectedNotes(n => [...n, name]);
  };

  const unselectRemoveNote = name => {
    setSelectedNotes(n => n.filter(n => n !== name));
  };

  const deleteSelected = () => {
    const allNotes = noteNames.filter(n => !selectedNotes.includes(n));
    setNoteNames(allNotes);
    let newCurNote = null;
    if (allNotes.length > 0) {
      if (selectedNotes.includes(props.curNote)) {
        newCurNote = allNotes[0];
        props.setCurNote(newCurNote);
      } else {
        newCurNote = props.curNote;
      }
    } else {
      props.setCurNote("main");
      setNoteNames(["main"]);
      props.setNote("");
      newCurNote = "main";
    }

    chrome.storage.sync.remove(selectedNotes);

    chrome.storage.sync.set({ allNotes: allNotes, curNote: newCurNote });

    setSelectedNotes([]);
    setDeleteMode(false);
  };

  const close = () => {
    setDeleteMode(false);
    props.setView(views.NOTE);
  };

  const getNameClasses = name => {
    let classes = null;
    if (selectedNotes.includes(name)) {
      classes = "massSelected";
    }

    if (props.curNote === name) {
      classes = classes ? classes + " curnote" : "curnote";
    }

    return classes;
  };

  return (
    <React.Fragment>
      <div className="menubar">
        <div className="header">All Notes</div>
        <i
          className="material-icons"
          style={{ marginLeft: "10px", marginRight: "10px", cursor: "pointer" }}
          title="Toggle Delete Mode"
          onClick={() => {
            setSelectedNotes([]);
            setDeleteMode(!deleteMode);
          }}
        >
          {!deleteMode ? "delete_outline" : "delete"}
        </i>
        {deleteMode ? (
          <button className="confirmdelete" onClick={deleteSelected}>
            Delete Selected
          </button>
        ) : null}
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
            className={getNameClasses(name)}
            title={props.curNote}
            onClick={
              !deleteMode
                ? () => selectNote(name)
                : () => {
                    !selectedNotes.includes(name)
                      ? selectRemoveNote(name)
                      : unselectRemoveNote(name);
                  }
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
