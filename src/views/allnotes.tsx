import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { Views } from "../types";
import { NotesState } from "../hooks/useNotes";

interface AllNotesProps {
  notesState: NotesState;
  setView: Dispatch<SetStateAction<Views>>;
}

const AllNotes = (props: AllNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const newNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote(e.target.value);
    setMsg(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      props.notesState.addNote(newNote);
      setNewNote("");
    } catch (e) {
      if (e instanceof Error) setMsg(e.message);
    }
  };

  const selectNote = (name: string) => {
    props.setView(Views.NOTE);
    props.notesState.syncCurNote(name);
  };

  const selectRemoveNote = (name: string) => {
    setSelectedNotes((n) => [...n, name]);
  };

  const unselectRemoveNote = (name: string) => {
    setSelectedNotes((n) => n.filter((n) => n !== name));
  };

  const deleteSelected = () => {
    props.notesState.deleteNotes(selectedNotes);

    setSelectedNotes([]);
    setDeleteMode(false);
  };

  const close = () => {
    setDeleteMode(false);
    props.setView(Views.NOTE);
  };

  const getNameClasses = (name: string) => {
    let classes = "";
    if (selectedNotes.includes(name)) {
      classes = "massSelected";
    }

    if (props.notesState.curNote === name) {
      classes = classes ? classes + " curnote" : "curnote";
    }

    return classes;
  };

  return (
    <>
      <div className="menubar">
        <div className="header">All Notes</div>
        <i
          className="material-icons"
          style={{ marginLeft: "10px", marginRight: "10px", cursor: "pointer" }}
          title="Toggle Delete Mode"
          data-testid="delete-mode-toggle"
          onClick={() => {
            setSelectedNotes([]);
            setDeleteMode(!deleteMode);
          }}
        >
          {!deleteMode ? "delete_outline" : "delete"}
        </i>
        {deleteMode ? (
          <button
            className="confirmdelete"
            onClick={deleteSelected}
            data-testid="confirm-delete"
          >
            Delete Selected
          </button>
        ) : null}
        <i
          className="material-icons"
          style={{ fontSize: "28px", cursor: "pointer", marginLeft: "auto" }}
          onClick={close}
          title="Close"
          data-testid="close-allnotes"
        >
          keyboard_arrow_down
        </i>
      </div>
      <div className="newnote">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="New Note Name"
            tabIndex={-1}
            value={newNote}
            onChange={newNoteChange}
            data-testid="new-note-input"
          ></input>
          <button type="submit" data-testid="create-new-note">
            Create
          </button>
        </form>
      </div>
      {msg ? (
        <div className="newnotemsg" data-testid="new-note-msg">
          {msg}
        </div>
      ) : null}
      <div
        className={!deleteMode ? "notelist" : "notelist deleting"}
        data-testid="note-list"
      >
        {props.notesState.allNotes.map((name) => (
          <div
            key={name}
            className={getNameClasses(name)}
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
    </>
  );
};

export default AllNotes;
