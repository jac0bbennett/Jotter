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

interface LinkPopup {
  linkInfo: LinkInfo;
  setLinkInfo: Dispatch<SetStateAction<LinkInfo>>;
  setNote: (note: string) => void;
  notepadRef: RefObject<HTMLDivElement>;
  setShowLinkPopup: Dispatch<SetStateAction<boolean>>;
}

const LinkPopup = forwardRef(
  (props: LinkPopup, ref: ForwardedRef<HTMLDivElement>) => {
    const linkPopupRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(
      ref,
      () => linkPopupRef.current ?? new HTMLDivElement()
    );

    const { notepadRef, linkInfo, setShowLinkPopup, setLinkInfo, setNote } =
      props;

    useEffect(() => {
      if (!linkInfo.target) {
        setEditMode(true);
        setEditedText("");
        setEditedUrl("");
      }
    }, [linkInfo]);

    useEffect(() => {
      const clickEventListner = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) return;
        if (
          notepadRef.current &&
          notepadRef.current.contains(e.target) &&
          e.target instanceof HTMLAnchorElement
        ) {
          const linkRect = e.target.getBoundingClientRect();
          setLinkInfo({
            top: Math.max(linkRect.top - 30, 10),
            url: e.target.getAttribute("href") ?? "",
            text: e.target.textContent ?? "",
            target: e.target,
          });
          setShowLinkPopup(true);
        } else if (
          (linkPopupRef.current && linkPopupRef.current.contains(e.target)) ||
          e.target.getAttribute("data-testid") === "create-link" ||
          (e.target.classList.contains("link-popup-option") &&
            !e.target.classList.contains("link-popup-remove-button"))
        ) {
          setShowLinkPopup(true);
        } else {
          setShowLinkPopup(false);
        }
      };

      document.addEventListener("click", clickEventListner);
      return () => document.removeEventListener("click", clickEventListner);
    }, [notepadRef, linkInfo, setShowLinkPopup, setLinkInfo, linkPopupRef]);

    const [editMode, setEditMode] = useState(false);
    const [editedUrl, setEditedUrl] = useState(linkInfo.url);
    const [editedText, setEditedText] = useState(linkInfo.text);

    const editLink = () => {
      setEditMode(true);
      setEditedUrl(linkInfo.url);
      setEditedText(linkInfo.text);
    };

    const saveEditedLink = () => {
      if (!notepadRef.current || !editedUrl) return;
      const newLinkText = editedText?.trim() || editedUrl;

      if (linkInfo.target) {
        linkInfo.target.href = editedUrl ?? "";
        linkInfo.target.textContent = newLinkText;
      } else {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        if (linkInfo.documentRange) {
          selection?.addRange(linkInfo.documentRange);
        } else {
          const range = document.createRange();
          range.selectNodeContents(notepadRef.current);
          range.collapse(false);
          selection?.addRange(range);
        }

        document.execCommand(
          "insertHTML",
          false,
          `<a href="${editedUrl}">${newLinkText}</a>`
        );
      }
      setEditMode(false);
      setShowLinkPopup(false);
      setNote(notepadRef.current.innerHTML);
      notepadRef.current.focus();
    };

    const removeLink = () => {
      if (!linkInfo.target || !notepadRef.current) return;
      linkInfo.target.replaceWith(linkInfo.text ?? "");
      setNote(notepadRef.current.innerHTML);
      setShowLinkPopup(false);
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
            top: linkInfo.top + "px",
          }}
        >
          {!editMode ? (
            <a
              href={linkInfo.url}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap"
              data-testid="link-popup-link"
            >
              {linkInfo.url}
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
                  data-testid="link-popup-text-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <i className="material-icons">link</i>
                <input
                  type="url"
                  className="ml-1 grow rounded px-1"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  data-testid="link-popup-url-input"
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
                  data-testid="link-popup-edit-button"
                >
                  edit
                </i>
                <i
                  className="material-icons link-popup-option link-popup-remove-button"
                  onClick={removeLink}
                  data-testid="link-popup-remove-button"
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
                    data-testid="link-popup-save-button"
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
