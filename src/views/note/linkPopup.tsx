import {
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
  RefObject,
  SetStateAction,
  Dispatch,
  FormEvent,
  ForwardedRef
} from "react";
import { LinkInfo } from "../../interfaces";

interface LinkPopupProps {
  linkInfo: LinkInfo;
  setLinkInfo: Dispatch<SetStateAction<LinkInfo>>;
  setNote: (note: string) => void;
  notepadRef: RefObject<HTMLDivElement>;
}

const LinkPopup = forwardRef(
  (props: LinkPopupProps, ref: ForwardedRef<HTMLDivElement>) => {
    const linkPopupRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(
      ref,
      () => linkPopupRef.current ?? new HTMLDivElement()
    );

    const [editMode, setEditMode] = useState(false);
    const [editedUrl, setEditedUrl] = useState(props.linkInfo.url);

    const editLink = () => {
      setEditMode(true);
      setEditedUrl(props.linkInfo.url);
    };

    const saveEditedLink = () => {
      if (!props.linkInfo.target) return;
      props.linkInfo.target.href = editedUrl;
      props.setLinkInfo(prevState => {
        return {
          url: editedUrl,
          top: prevState.top,
          target: prevState.target
        };
      });
      props.setNote(props.notepadRef.current!.innerHTML);
      setEditMode(false);
    };

    const submitForm = (e: FormEvent) => {
      e.preventDefault();
      saveEditedLink();
    };

    return (
      <form onSubmit={submitForm}>
        <div
          id="link-popup"
          style={{
            top: props.linkInfo.top + "px"
          }}
          ref={linkPopupRef}
        >
          <i className="material-icons" style={{ marginRight: "5px" }}>
            public
          </i>
          {!editMode ? (
            <a href={props.linkInfo.url} target="_blank">
              {props.linkInfo.url}
            </a>
          ) : (
            <input
              type="text"
              value={editedUrl}
              onChange={e => setEditedUrl(e.target.value)}
            />
          )}
          <div className="link-popup-options">
            {!editMode ? (
              <>
                <i className="material-icons" onClick={editLink}>
                  edit
                </i>
                <i className="material-icons">remove</i>
              </>
            ) : (
              <i className="material-icons" onClick={saveEditedLink}>
                save
              </i>
            )}
          </div>
        </div>
      </form>
    );
  }
);

export default LinkPopup;
