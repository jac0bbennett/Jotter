import { vi, describe, it, expect, beforeAll, beforeEach } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import AllNotes from "../views/allNotes";
import { NotesState } from "../hooks/useNotes";
import { mockNotesState } from "./utils/mockNotesState";
import { Views } from "../types";

describe("AllNotes", () => {
  let notesState: NotesState;
  let setView: () => void;

  beforeAll(() => {
    notesState = mockNotesState;
    setView = vi.fn();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  const genericSetup = () => {
    notesState.allNotes = ["note1", "note2", "note3"];
  };

  const renderComponent = () => {
    return render(<AllNotes notesState={notesState} setView={setView} />);
  };

  it("should render", () => {
    // Arrange
    genericSetup();

    // Act
    renderComponent();
  });

  it("should render all notes", () => {
    // Arrange
    genericSetup();

    // Act
    const { getByText } = renderComponent();

    // Assert
    notesState.allNotes.forEach((note) => {
      expect(getByText(note)).toBeTruthy();
    });
  });

  it("clicking a note should call setView", () => {
    // Arrange
    genericSetup();
    const { getByText } = renderComponent();

    // Act
    fireEvent.click(getByText("note1"));

    // Assert
    expect(setView).toHaveBeenCalledOnce();
    expect(setView).toHaveBeenCalledWith(Views.NOTE);
  });

  it("clicking a note should call syncCurNote", () => {
    // Arrange
    genericSetup();
    const { getByText } = renderComponent();

    // Act
    fireEvent.click(getByText("note1"));

    // Assert
    expect(notesState.syncCurNote).toHaveBeenCalledOnce();
    expect(notesState.syncCurNote).toHaveBeenCalledWith("note1");
  });

  it("clicking close all notes should call setView", () => {
    // Arrange
    genericSetup();
    const { getByTestId } = renderComponent();
    const close = getByTestId("close-allnotes");

    // Act
    fireEvent.click(close);

    // Assert
    expect(setView).toHaveBeenCalledOnce();
    expect(setView).toHaveBeenCalledWith(Views.NOTE);
  });

  it("clicking delete toggle should turn on delete mode", () => {
    // Arrange
    genericSetup();
    const { getByTestId } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");

    // Act
    fireEvent.click(deleteToggle);

    // Assert
    expect(getByTestId("confirm-delete")).toBeTruthy();
    expect(getByTestId("note-list").classList).toContainEqual("deleting");
  });

  it("clicking delete toggle while in delete mode should toggle off", () => {
    // Arrange
    genericSetup();
    const { getByTestId, queryByTestId } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");
    fireEvent.click(deleteToggle);

    // Act
    fireEvent.click(deleteToggle);

    // Assert
    expect(queryByTestId("confirm-delete")).toBeNull();
    expect(getByTestId("note-list").classList.contains("deleting")).toBeFalsy();
  });

  it("clicking note while in delete mode shouldn't call setView", () => {
    // Arrange
    genericSetup();
    const { getByTestId, getByText } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");
    fireEvent.click(deleteToggle);

    // Act
    fireEvent.click(getByText("note1"));

    // Assert
    expect(setView).toHaveBeenCalledTimes(0);
  });

  it("clicking confirm delete should call deleteNotes", () => {
    // Arrange
    genericSetup();
    const { getByTestId } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");
    fireEvent.click(deleteToggle);

    // Act
    fireEvent.click(getByTestId("confirm-delete"));

    // Assert
    expect(notesState.deleteNotes).toHaveBeenCalledOnce();
  });

  it("clicking a note and confirming delete should call deleteNotes with note", () => {
    // Arrange
    genericSetup();
    const { getByTestId, getByText } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");
    fireEvent.click(deleteToggle);

    // Act
    fireEvent.click(getByText("note1"));
    fireEvent.click(getByTestId("confirm-delete"));

    // Assert
    expect(notesState.deleteNotes).toHaveBeenCalledOnce();
    expect(notesState.deleteNotes).toHaveBeenCalledWith(["note1"]);
  });

  it("clicking multiple notes and confirming delete should call deleteNotes with notes", () => {
    // Arrange
    genericSetup();
    const { getByTestId, getByText } = renderComponent();
    const deleteToggle = getByTestId("delete-mode-toggle");
    fireEvent.click(deleteToggle);

    // Act
    fireEvent.click(getByText("note1"));
    fireEvent.click(getByText("note2"));
    fireEvent.click(getByTestId("confirm-delete"));

    // Assert
    expect(notesState.deleteNotes).toHaveBeenCalledOnce();
    expect(notesState.deleteNotes).toHaveBeenCalledWith(["note1", "note2"]);
  });

  it("typing in a note name and clicking create note should call createNote", () => {
    // Arrange
    genericSetup();
    const { getByTestId } = renderComponent();
    const input = getByTestId("new-note-input");
    const createNote = getByTestId("create-new-note");

    // Act
    fireEvent.change(input, { target: { value: "note4" } });
    fireEvent.click(createNote);

    // Assert
    expect(notesState.addNote).toHaveBeenCalledOnce();
    expect(notesState.addNote).toHaveBeenCalledWith("note4");
  });

  it("should show error message if add note fails", () => {
    // Arrange
    genericSetup();
    vi.spyOn(notesState, "addNote").mockImplementation(() => {
      throw new Error("Note already exists");
    });
    const { getByTestId } = renderComponent();
    const input = getByTestId("new-note-input");
    const createNote = getByTestId("create-new-note");

    // Act
    fireEvent.change(input, { target: { value: "note4" } });
    fireEvent.click(createNote);

    // Assert
    expect(getByTestId("new-note-msg").textContent).toEqual(
      "Note already exists"
    );
  });
});
