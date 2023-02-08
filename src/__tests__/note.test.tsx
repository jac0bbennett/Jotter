import {
  RenderResult,
  render,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesState } from "../hooks/useNotes";
import { ThemeState } from "../hooks/useTheme";
import { Themes, Views } from "../types";
import Note from "../views/note/note";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNotesState } from "./utils/mockNotesState";
import { mockTheme } from "./utils/mockTheme";

describe("note", () => {
  let notesState: NotesState;
  let theme: ThemeState;
  let setView: () => void;
  let component: RenderResult;

  vi.useFakeTimers();

  beforeAll(() => {
    notesState = mockNotesState;
    theme = mockTheme;

    setView = vi.fn();

    Object.defineProperty(global.document, "documentElement", {
      writable: true,
      value: document.createElement("div"),
    });

    global.document.queryCommandValue = vi.fn();
    global.document.execCommand = vi.fn();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllTimers();
    cleanup();
  });

  const renderComponent = () => {
    component = render(
      <Note notesState={notesState} setView={setView} theme={theme} />
    );
    return component;
  };

  const genericNoteSetup = () => {
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];
  };

  it("should render", () => {
    // Arrange
    // Act
    renderComponent();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should set noteContent after input", async () => {
    // Arrange
    renderComponent();
    const input = component.getByTestId("notepad");

    // Act
    fireEvent.blur(input, { target: { textContent: "test" } });

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.setNoteContent).toHaveBeenLastCalledWith("test");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.addNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncCurNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncAllNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(0);
  });

  it("should sync noteContent after delay", async () => {
    // Arrange
    renderComponent();
    const input = component.getByTestId("notepad");

    // Act
    fireEvent.blur(input, { target: { textContent: "test" } });
    vi.runAllTimers();

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.setNoteContent).toHaveBeenLastCalledWith("test");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.addNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncCurNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncAllNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenLastCalledWith(
      "test",
      expect.any(Function)
    );
  });

  it("should sync noteContent once after 2 recent inputs", async () => {
    // Arrange
    renderComponent();
    const input = component.getByTestId("notepad");

    // Act
    fireEvent.blur(input, { target: { textContent: "test" } });
    fireEvent.blur(input, { target: { textContent: "testing" } });
    vi.runAllTimers();

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(2);
    expect(notesState.setNoteContent).toHaveBeenNthCalledWith(1, "test");
    expect(notesState.setNoteContent).toHaveBeenNthCalledWith(2, "testing");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.addNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncCurNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncAllNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenLastCalledWith(
      "testing",
      expect.any(Function)
    );
  });

  it("should sync noteContent twice when 2nd input is delayed", async () => {
    // Arrange
    renderComponent();
    const input = component.getByTestId("notepad");

    // Act
    fireEvent.blur(input, { target: { textContent: "test" } });
    vi.runAllTimers();
    fireEvent.blur(input, { target: { textContent: "testing" } });
    vi.runAllTimers();

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(2);
    expect(notesState.setNoteContent).toHaveBeenNthCalledWith(1, "test");
    expect(notesState.setNoteContent).toHaveBeenNthCalledWith(2, "testing");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.addNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncCurNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncAllNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(2);
    expect(notesState.syncNoteContent).toHaveBeenNthCalledWith(
      1,
      "test",
      expect.any(Function)
    );
    expect(notesState.syncNoteContent).toHaveBeenNthCalledWith(
      2,
      "testing",
      expect.any(Function)
    );
  });

  it("should populate note content", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();

    // Assert
    const input = component.getByTestId("notepad");
    expect(input.textContent).toEqual("testing");
  });

  it("should populate curNote", async () => {
    // Arrange
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];

    // Act
    renderComponent();

    // Assert
    const el = component.getByTestId("current-note-name");
    expect(el.textContent).toEqual("test");
  });

  it("should call setView when clicking all notes", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const el = component.getByTestId("view-all-notes");
    fireEvent.click(el);

    // Assert
    expect(setView).toHaveBeenCalledTimes(1);
    expect(setView).toHaveBeenLastCalledWith(Views.ALLNOTES);
  });

  it("should save and exit when clicking exit button", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const el = component.getByTestId("exit");
    fireEvent.click(el);

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(0);
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenLastCalledWith(
      "testing",
      expect.any(Function)
    );
  });

  it("should save and exit when exit button is clicked before save timer ends", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const exitButton = component.getByTestId("exit");
    const input = component.getByTestId("notepad");
    fireEvent.blur(input, { target: { textContent: "test" } });
    fireEvent.click(exitButton);

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.setNoteContent).toHaveBeenLastCalledWith("test");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenLastCalledWith(
      notesState.noteContent,
      expect.any(Function)
    );
  });

  it("should change to alt theme when long pressing logo", async () => {
    // Arrange
    genericNoteSetup();

    renderComponent();

    // Act
    const el = component.getByTestId("logo");
    fireEvent.mouseDown(el);
    vi.runAllTimers();

    // Assert
    expect(theme.setTheme).toHaveBeenCalledTimes(1);
    expect(theme.setTheme).toHaveBeenLastCalledWith(Themes.ALT);
  });

  it("should change back to default theme when long pressing logo from alt theme", async () => {
    // Arrange
    genericNoteSetup();

    theme.theme = Themes.ALT;

    renderComponent();

    // Act
    const el = component.getByTestId("logo");
    fireEvent.mouseDown(el);
    vi.runAllTimers();

    // Assert
    expect(theme.setTheme).toHaveBeenCalledTimes(1);
    expect(theme.setTheme).toHaveBeenLastCalledWith(Themes.DEFAULT);
  });

  it("should already be alt theme", async () => {
    // Arrange
    genericNoteSetup();
    theme.theme = Themes.ALT;

    // Act
    renderComponent();

    // Assert
    const logo = component.getByTestId("logo");
    expect(logo.textContent).toEqual("Jotter");
  });

  it("should change to jonah theme when long pressing char count at secret number", async () => {
    // Arrange
    genericNoteSetup();
    notesState.noteContent = "a".repeat(69);

    renderComponent();
    const charCount = component.getByTestId("char-count");

    // Act
    fireEvent.mouseDown(charCount);
    vi.runAllTimers();

    // Assert
    expect(theme.setTheme).toHaveBeenCalledTimes(1);
    expect(theme.setTheme).toHaveBeenLastCalledWith(Themes.JONAH);
  });

  it("should not change to jonah theme when long pressing char count at arbitrary value", async () => {
    // Arrange
    genericNoteSetup();

    renderComponent();

    // Act
    const el = component.getByTestId("char-count");
    fireEvent.mouseDown(el);
    vi.runAllTimers();

    // Assert
    expect(theme.setTheme).toHaveBeenCalledTimes(0);
  });

  it("should already be set to jonah theme", async () => {
    // Arrange
    genericNoteSetup();

    theme.theme = Themes.JONAH;

    // Act
    renderComponent();

    // Assert
    const logo = component.getByTestId("logo");
    expect(logo.textContent).toEqual("Joner");
  });

  it("should change back to default theme when long pressing logo from jonah theme", async () => {
    // Arrange
    genericNoteSetup();
    notesState.noteContent = "a".repeat(69);
    theme.theme = Themes.JONAH;

    renderComponent();

    // Act
    const logo = component.getByTestId("logo");
    fireEvent.mouseDown(logo);
    vi.runAllTimers();

    // Assert
    expect(theme.setTheme).toHaveBeenCalledTimes(1);
    expect(theme.setTheme).toHaveBeenLastCalledWith(Themes.DEFAULT);
  });

  it("should display error when setNoteContent fails", async () => {
    // Arrange
    const expectedErrorMessage = "Note exceeding max length";
    genericNoteSetup();
    vi.spyOn(notesState, "setNoteContent").mockImplementation(() => {
      throw new Error(expectedErrorMessage);
    });

    // Act
    renderComponent();
    const input = component.getByTestId("notepad");
    fireEvent.blur(input, { target: { textContent: "test" } });

    // Assert
    const error = component.getByTestId("error-msg");
    expect(error.textContent).toEqual(expectedErrorMessage);
  });

  it("should paste plain text when pasting html", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const input = component.getByTestId("notepad");
    userEvent.click(input);
    userEvent.paste("testing stuff");

    // Assert
    expect(global.document.execCommand).toHaveBeenCalledTimes(1);
    expect(global.document.execCommand).toHaveBeenLastCalledWith(
      "insertHtml",
      false,
      "testing stuff"
    );
  });

  it("should paste text including link when url is present", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const input = component.getByTestId("notepad");
    userEvent.click(input);
    userEvent.paste("testing stuff https://google.com and other things");

    // Assert
    expect(global.document.execCommand).toHaveBeenCalledTimes(1);
    expect(global.document.execCommand).toHaveBeenLastCalledWith(
      "insertHtml",
      false,
      'testing stuff <a href="https://google.com">https://google.com</a> and other things'
    );
  });

  it("should insert 4 spaces when tab is pressed", async () => {
    // Arrange
    genericNoteSetup();

    // Act
    renderComponent();
    const input = component.getByTestId("notepad");
    fireEvent.keyDown(input, { key: "Tab", code: "Tab" });

    // Assert
    expect(global.document.execCommand).toHaveBeenCalledTimes(1);
    expect(global.document.execCommand).toHaveBeenLastCalledWith(
      "insertText",
      false,
      "    "
    );
  });

  it("should show link popup when a link is clicked in the notepad", async () => {
    // Arrange
    genericNoteSetup();
    notesState.noteContent =
      '<a href="https://google.com">https://google.com</a>';

    renderComponent();
    const link = component.getByText("https://google.com");

    // Act
    fireEvent.click(link);

    // Assert
    const linkPopup = component.getByTestId("link-popup");
    const linkPopupLink = component.getByTestId("link-popup-link");
    expect(linkPopup).toBeTruthy();
    expect(linkPopupLink.textContent).toEqual("https://google.com");
  });

  it("should hide link popup when clicked outside of link popup", async () => {
    // Arrange
    genericNoteSetup();
    notesState.noteContent =
      '<a href="https://google.com">https://google.com</a>';

    renderComponent();
    const input = component.getByTestId("notepad");
    const link = component.getByText("https://google.com");

    // Act
    fireEvent.click(link);
    fireEvent.click(input);

    // Assert
    expect(component.queryByTestId("link-popup")).toBeNull();
  });

  it("should show link popup when create link button is clicked", async () => {
    // Arrange
    genericNoteSetup();

    renderComponent();
    const createLink = component.getByTestId("create-link");

    // Act
    fireEvent.click(createLink);

    // Assert
    const linkPopup = component.getByTestId("link-popup");
    expect(linkPopup).toBeTruthy();
    expect(
      (component.getByTestId("link-popup-text-input") as HTMLInputElement).value
    ).toBe("");
    expect(
      (component.getByTestId("link-popup-url-input") as HTMLInputElement).value
    ).toBe("");
  });
});
