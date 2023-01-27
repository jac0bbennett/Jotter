import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState
} from "react";
import { Views } from "../interfaces";

interface AllNotesProps {
  setView: Dispatch<SetStateAction<Views>>;
  setCurNote: Dispatch<SetStateAction<string | null>>;
  curNote: string | null;
  setNote: Dispatch<SetStateAction<string>>;
  noteNames: string[];
  setNoteNames: Dispatch<SetStateAction<string[]>>;
}

const AllNotes = (props: AllNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // TODO: Cleanup logic may still be useful at somepoint
  // useEffect(() => {
  //   chrome.storage.sync.get("allNotes", obj => {
  //     const allNotes = obj.allNotes;
  //     if (allNotes && allNotes.length > 0) {
  //       setNoteNames(allNotes);
  //     } else {
  //       chrome.storage.sync.set({ allNotes: ["main"], curNote: "main" });
  //       setNoteNames(["main"]);
  //     }
  //     // let undeleted = [];
  //     // chrome.storage.sync.get(undefined, obj2 => {
  //     //   for (const n in obj2) {
  //     //     if (
  //     //       !allNotes ||
  //     //       (!allNotes.includes(n) && !["allNotes", "curNote"].includes(n))
  //     //     ) {
  //     //       undeleted.push(n);
  //     //     }
  //     //   }
  //     //   chrome.storage.sync.remove(undeleted);
  //     // });
  //   });
  // }, []);

  const newNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote(e.target.value);
    setMsg(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!["allNotes", "curNote"].includes(newNote)) {
      if (!newNote) {
        setMsg("Name can't be blank!");
      } else if (props.noteNames.includes(newNote)) {
        setMsg("Name must be unique!");
      } else if (newNote.length > 40) {
        setMsg("Name too long! (<=40)");
      } else if (props.noteNames.length >= 400) {
        setMsg("Cannot have more than 400 notes!");
      } else {
        const allNotes = [newNote, ...props.noteNames];
        props.setNoteNames(allNotes);
        chrome.storage.sync.set({ allNotes });
        setNewNote("");
      }
    } else {
      setMsg("Invalid note name!");
    }
  };

  const selectNote = (name: string) => {
    chrome.storage.sync.set({ curNote: name });
    props.setView(Views.NOTE);
    props.setCurNote(name);
  };

  const selectRemoveNote = (name: string) => {
    setSelectedNotes(n => [...n, name]);
  };

  const unselectRemoveNote = (name: string) => {
    setSelectedNotes(n => n.filter(n => n !== name));
  };

  const deleteSelected = () => {
    let allNotes = props.noteNames.filter(n => !selectedNotes.includes(n));
    props.setNoteNames(allNotes);
    let newCurNote = null;
    if (allNotes.length > 0) {
      if (props.curNote && selectedNotes.includes(props.curNote)) {
        newCurNote = allNotes[0];
        props.setCurNote(newCurNote);
      } else {
        newCurNote = props.curNote;
      }
    } else {
      const defaultNote = "main";
      props.setCurNote(defaultNote);
      props.setNoteNames([defaultNote]);
      props.setNote("");
      newCurNote = defaultNote;
      allNotes = [defaultNote];
    }

    chrome.storage.sync.remove(selectedNotes);

    chrome.storage.sync.set({ allNotes: allNotes, curNote: newCurNote });

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

    if (props.curNote === name) {
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
            tabIndex={-1}
            value={newNote}
            onChange={newNoteChange}
          ></input>
          <button type="submit">Create</button>
        </form>
      </div>
      {msg ? <div className="newnotemsg">{msg}</div> : null}
      <div className={!deleteMode ? "notelist" : "notelist deleting"}>
        {props.noteNames.map(name => (
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
