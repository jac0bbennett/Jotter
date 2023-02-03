import {
  RenderResult,
  render,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { NotesState } from "../hooks/useNotes";
import { ThemeState } from "../hooks/useTheme";
import { Themes, Views } from "../types";
import Note from "../views/note/note";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("note", () => {
  let notesState: NotesState;
  let theme: ThemeState;
  let setView: () => void;
  let component: RenderResult;

  vi.useFakeTimers();

  beforeAll(() => {
    notesState = {
      allNotes: [],
      curNote: "",
      noteContent: "",
      syncAllNotes: vi.fn(),
      syncCurNote: vi.fn(),
      syncNoteContent: vi.fn(),
      deleteNotes: vi.fn(),
      getNoteData: vi.fn(),
      addNote: vi.fn(),
      setNoteContent: vi.fn(),
    };

    theme = {
      theme: Themes.DEFAULT,
      setTheme: vi.fn(),
    };

    setView = vi.fn();

    Object.defineProperty(global.document, "documentElement", {
      writable: true,
      value: document.createElement("div"),
    });

    global.document.queryCommandValue = vi.fn();
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
    expect(notesState.setNoteContent).toHaveBeenCalledWith("test");
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
    expect(notesState.setNoteContent).toHaveBeenCalledWith("test");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.addNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncCurNote).toHaveBeenCalledTimes(0);
    expect(notesState.syncAllNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenCalledWith(
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
    expect(notesState.syncNoteContent).toHaveBeenCalledWith(
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
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];

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
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];

    // Act
    renderComponent();
    const el = component.getByTestId("view-all-notes");
    fireEvent.click(el);

    // Assert
    expect(setView).toHaveBeenCalledTimes(1);
    expect(setView).toHaveBeenCalledWith(Views.ALLNOTES);
  });

  it("should save and exit when clicking exit button", async () => {
    // Arrange
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];

    // Act
    renderComponent();
    const el = component.getByTestId("exit");
    fireEvent.click(el);

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(0);
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenCalledWith(
      "testing",
      expect.any(Function)
    );
  });

  it("should save and exit when exit button is clicked before save timer ends", async () => {
    // Arrange
    notesState.curNote = "test";
    notesState.noteContent = "testing";
    notesState.allNotes = ["test"];

    // Act
    renderComponent();
    const el = component.getByTestId("exit");
    fireEvent.blur(el, { target: { textContent: "test" } });
    el.click();

    // Assert
    expect(notesState.setNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.setNoteContent).toHaveBeenCalledWith("test");
    expect(notesState.deleteNotes).toHaveBeenCalledTimes(0);
    expect(notesState.syncNoteContent).toHaveBeenCalledTimes(1);
    expect(notesState.syncNoteContent).toHaveBeenCalledWith(
      "test",
      expect.any(Function)
    );
  });
});
