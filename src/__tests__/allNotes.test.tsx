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

  it("should call setView when note is clicked", () => {
    // Arrange
    genericSetup();
    const { getByText } = renderComponent();

    // Act
    fireEvent.click(getByText("note1"));

    // Assert
    expect(setView).toHaveBeenCalledOnce();
    expect(setView).toHaveBeenLastCalledWith(Views.NOTE);
  });

  it("should call syncCurNote when note is clicked", () => {
    // Arrange
    genericSetup();
    const { getByText } = renderComponent();

    // Act
    fireEvent.click(getByText("note1"));

    // Assert
    expect(notesState.syncCurNote).toHaveBeenCalledOnce();
    expect(notesState.syncCurNote).toHaveBeenLastCalledWith("note1");
  });

  it("should call setView when close all notes is clicked", () => {
    // Arrange
    genericSetup();
    const { getByTestId } = renderComponent();
    const close = getByTestId("close-allnotes");

    // Act
    fireEvent.click(close);

    // Assert
    expect(setView).toHaveBeenCalledOnce();
    expect(setView).toHaveBeenLastCalledWith(Views.NOTE);
  });

  it("should turn on delete mode when delete toggle is clicked", () => {
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

  it("should toggle off delete mode when delete toggle is clicked again", () => {
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

  it("should not call setView if not is clicked while in delete mode", () => {
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

  it("should call deleteNotes when confirm delete is clicked", () => {
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

  it("should call deleteNotes with note when note and confirm delete are clicked", () => {
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
    expect(notesState.deleteNotes).toHaveBeenLastCalledWith(["note1"]);
  });

  it("should call deleteNotes with notes when multiple notes are selected and confirm delete is clicked", () => {
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
    expect(notesState.deleteNotes).toHaveBeenLastCalledWith(["note1", "note2"]);
  });

  it("should call createNote when note name is entered and create note is clicked", () => {
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
    expect(notesState.addNote).toHaveBeenLastCalledWith("note4");
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
