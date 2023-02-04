import {
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
  RefObject,
  SetStateAction,
  Dispatch,
  FormEvent,
  ForwardedRef,
  useEffect,
} from "react";
import { LinkInfo } from "../types";

interface LinkPopupProps {
  linkInfo: LinkInfo;
  setLinkInfo: Dispatch<SetStateAction<LinkInfo>>;
  setNote: (note: string) => void;
  notepadRef: RefObject<HTMLDivElement>;
  closePopup: () => void;
}

const LinkPopup = forwardRef(
  (props: LinkPopupProps, ref: ForwardedRef<HTMLDivElement>) => {
    const linkPopupRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(
      ref,
      () => linkPopupRef.current ?? new HTMLDivElement()
    );

    useEffect(() => {
      if (!props.linkInfo.target) {
        setEditMode(true);
        setEditedText("");
        setEditedUrl("");
      }
    }, [props.linkInfo]);

    const [editMode, setEditMode] = useState(false);
    const [editedUrl, setEditedUrl] = useState(props.linkInfo.url);
    const [editedText, setEditedText] = useState(props.linkInfo.text);

    const editLink = () => {
      setEditMode(true);
      setEditedUrl(props.linkInfo.url);
      setEditedText(props.linkInfo.text);
    };

    const saveEditedLink = () => {
      if (!props.notepadRef.current || !editedUrl) return;
      const linkText = editedText ?? editedUrl;
      if (props.linkInfo.target) {
        props.linkInfo.target.href = editedUrl ?? "";
        props.linkInfo.target.innerText = linkText;
      } else {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        if (props.linkInfo.documentRange) {
          selection?.addRange(props.linkInfo.documentRange);
        } else {
          const range = document.createRange();
          range.selectNodeContents(props.notepadRef.current);
          range.collapse(false);
          selection?.addRange(range);
        }

        document.execCommand(
          "insertHTML",
          false,
          `<a href="${editedUrl}">${linkText}</a>`
        );
      }
      props.setLinkInfo((prevState) => {
        return {
          url: editedUrl,
          text: editedText,
          top: prevState.top,
          target: prevState.target,
        };
      });
      setEditMode(false);
      props.closePopup();
      props.setNote(props.notepadRef.current.innerHTML);
      props.notepadRef.current.focus();
    };

    const removeLink = () => {
      if (!props.linkInfo.target || !props.notepadRef.current) return;
      props.linkInfo.target.replaceWith(props.linkInfo.text ?? "");
      props.setNote(props.notepadRef.current.innerHTML);
      props.closePopup();
    };

    const submitForm = (e: FormEvent) => {
      e.preventDefault();
      saveEditedLink();
    };

    return (
      <form onSubmit={submitForm} data-testid="link-popup">
        <div
          id="link-popup"
          ref={linkPopupRef}
          style={{
            top: props.linkInfo.top + "px",
          }}
        >
          {!editMode ? (
            <a
              href={props.linkInfo.url}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap"
            >
              {props.linkInfo.url}
            </a>
          ) : (
            <div className="flex w-11/12 flex-col gap-1.5">
              <label className="flex items-center justify-between">
                Text:
                <input
                  type="text"
                  className="ml-1 grow rounded px-1"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              </label>
              <label className="flex items-center justify-between">
                <i className="material-icons">link</i>
                <input
                  type="url"
                  className="ml-1 grow rounded px-1"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                />
              </label>
            </div>
          )}
          <div className="link-popup-options">
            {!editMode ? (
              <>
                <i
                  className="material-icons link-popup-option mr-2"
                  onClick={editLink}
                >
                  edit
                </i>
                <i
                  className="material-icons link-popup-option"
                  onClick={removeLink}
                >
                  link_off
                </i>
              </>
            ) : (
              <>
                <button type="submit" className="-mr-1">
                  <i
                    className="material-icons link-popup-option"
                    style={{ fontSize: "20px" }}
                  >
                    save
                  </i>
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    );
  }
);

LinkPopup.displayName = "LinkPopup";
export default LinkPopup;
