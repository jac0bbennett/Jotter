import { ALL_NOTES_KEY, CURRENT_NOTE_KEY } from "./../../types";
import { renderHook } from "@testing-library/react";
import { useNotes } from "./../../hooks/useNotes";
import { chromeMock } from "./../utils/mockChrome";
import { act } from "react-dom/test-utils";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

describe("useNotes", () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.chrome = chromeMock as any;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockChromeGet = (
    allNotes = ["main", "test"],
    curNote: string | null = "main",
    notes: Record<string, string> = {}
  ) => {
    vi.spyOn(chromeMock.storage.sync, "get").mockImplementation(
      (key: string[], callback) => {
        const resp = {} as Record<string, string | string[]>;
        if (curNote && key.includes("curNote")) resp["curNote"] = curNote;
        if (key.includes("allNotes")) resp["allNotes"] = allNotes;

        for (const [key, value] of Object.entries(notes)) {
          if (key.includes(key)) resp[key] = value;
        }

        callback(resp);
      }
    );
  };

  it("should initialize new state", async () => {
    // Arrange
    vi.spyOn(chromeMock.storage.sync, "get").mockImplementation(
      (key: string[], callback) => {
        const resp = {} as Record<string, string | string[]>;

        callback(resp);
      }
    );

    // Act
    const { result } = renderHook(() => useNotes());

    // Assert
    expect(result.current.allNotes).toEqual(["main"]);
    expect(result.current.curNote).toEqual("main");
    expect(result.current.noteContent).toEqual("");
    expect(chromeMock.storage.sync.get).toHaveBeenCalledWith(
      ["curNote", "allNotes"],
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      curNote: "main",
      allNotes: ["main"],
    });
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should initialize curNote based on allNotes", async () => {
    // Arrange
    const expectedNoteName = "test";
    const expectedNoteContent = "testing";

    mockChromeGet([expectedNoteName, "main"], null, {
      [expectedNoteName]: expectedNoteContent,
    });

    // Act
    const { result } = renderHook(() => useNotes());

    // Assert
    expect(result.current.allNotes).toEqual([expectedNoteName, "main"]);
    expect(result.current.curNote).toEqual(expectedNoteName);
    expect(result.current.noteContent).toEqual(expectedNoteContent);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledWith(
      ["curNote", "allNotes"],
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      curNote: expectedNoteName,
      allNotes: [expectedNoteName, "main"],
    });
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should get and return noteContent of content of curNote", async () => {
    // Arrange
    const expectedNoteName = "test";
    const expectedNoteContent = "testing";

    mockChromeGet([expectedNoteName, "main"], expectedNoteName, {
      [expectedNoteName]: expectedNoteContent,
    });

    // Act
    const { result } = renderHook(() => useNotes());

    // Assert
    expect(result.current.allNotes).toEqual([expectedNoteName, "main"]);
    expect(result.current.curNote).toEqual(expectedNoteName);
    expect(result.current.noteContent).toEqual(expectedNoteContent);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledWith(
      ["curNote", "allNotes"],
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should set the note content", async () => {
    // Arrange
    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.setNoteContent("test and other");
    });

    // Assert
    expect(result.current.noteContent).toEqual("test and other");
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "main",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should set the note content then throw error for being too long", async () => {
    // Arrange
    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    const newNoteContent = "test".repeat(10000);

    // Act
    await act(async () => {
      const setNote = () => result.current.setNoteContent(newNoteContent);
      expect(setNote).toThrowError("Note exceeding max length! Cannot save!");
    });

    // Assert
    expect(result.current.noteContent).toEqual(newNoteContent);
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "main",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should sync the note content", async () => {
    // Arrange
    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    const newNoteContent = "test and other";

    await act(async () => {
      result.current.setNoteContent(newNoteContent);
    });

    // Act
    await act(async () => {
      result.current.syncNoteContent(newNoteContent);
    });

    // Assert
    expect(result.current.noteContent).toEqual("test and other");
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "main",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenLastCalledWith(
      {
        main: "test and other",
      },
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should fail to sync the note content because of chrome error", async () => {
    // Arrange
    vi.spyOn(chromeMock.storage.sync, "set").mockImplementation(
      (values: Record<string, string>, callback?: () => void) => {
        chromeMock.runtime.lastError = {
          message: "test error",
        };
        callback?.();
      }
    );

    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    const noteContent = "test and other";

    await act(async () => {
      result.current.setNoteContent(noteContent);
    });

    let error: Error | undefined;

    const callback = (e?: Error) => {
      error = e;
    };

    // Act
    await act(async () => {
      result.current.syncNoteContent(noteContent, callback);
    });

    // Assert
    expect(error).toBeDefined();
    expect(result.current.noteContent).toEqual("test and other");
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "main",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenLastCalledWith(
      {
        main: "test and other",
      },
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should set curNote", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.syncCurNote("test");
    });

    // Assert
    expect(result.current.curNote).toEqual("test");
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "test",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should set curNote to value not in allNotes yet", async () => {
    // Arrange
    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.syncCurNote("test");
    });

    // Assert
    expect(result.current.curNote).toEqual("test");
    expect(result.current.allNotes).toEqual(["test", "main"]);
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "test",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not set curNote to blank", async () => {
    // Arrange
    mockChromeGet(["main"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.syncCurNote("");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(chromeMock.storage.sync.get).toHaveBeenLastCalledWith(
      "main",
      expect.any(Function)
    );
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should add a new note", async () => {
    // Arrange
    vi.spyOn(chromeMock.storage.sync, "get").mockImplementation(
      (key: string[], callback) => {
        const resp = {} as Record<string, string | string[]>;
        if (key.includes("main")) resp["main"] = "test";
        if (key.includes("curNote")) resp["curNote"] = "main";
        if (key.includes("allNotes")) resp["allNotes"] = ["main", "test"];

        callback(resp);
      }
    );

    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.addNote("new note");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["new note", "main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenLastCalledWith({
      allNotes: ["new note", "main", "test"],
    });
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note with a blank name", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addBlankNote = () => result.current.addNote("");
      expect(addBlankNote).toThrowError("Name can't be blank!");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note with a name that already exists", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addDuplicateNote = () => result.current.addNote("test");
      expect(addDuplicateNote).toThrowError("Name must be unique!");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note with length > 30 characters", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addLongNote = () =>
        result.current.addNote("this is a very long note name indeed see");
      expect(addLongNote).toThrowError("Name too long! (<=30)");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note if already at 50 notes", async () => {
    // Arrange
    const allNotes = new Array(50).fill(0).map((_, i) => `note ${i}`);
    mockChromeGet(["main", ...allNotes], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addTooManyNotes = () => result.current.addNote("new note");
      expect(addTooManyNotes).toThrowError("Cannot have more than 50 notes!");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", ...allNotes]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note named the same as curNote key", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addCurNote = () => result.current.addNote(CURRENT_NOTE_KEY);
      expect(addCurNote).toThrowError("Invalid note name!");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should not allow a new note named the same as allNotes key", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      const addCurNote = () => result.current.addNote(ALL_NOTES_KEY);
      expect(addCurNote).toThrowError("Invalid note name!");
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main", "test"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(0);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(0);
  });

  it("should delete a note", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.deleteNotes(["test"]);
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      allNotes: ["main"],
      curNote: "main",
    });
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith(["test"]);
  });

  it("should delete multiple notes", async () => {
    // Arrange
    mockChromeGet(["main", "test", "test2"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.deleteNotes(["test", "test2"]);
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      allNotes: ["main"],
      curNote: "main",
    });
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith([
      "test",
      "test2",
    ]);
  });

  it("should remove note set as curNote", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "test", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.deleteNotes(["test"]);
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      allNotes: ["main"],
      curNote: "main",
    });
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith(["test"]);
  });

  it("should delete all notes", async () => {
    // Arrange
    mockChromeGet(["main", "test"], "main", { main: "test" });

    const { result } = renderHook(() => useNotes());

    // Act
    await act(async () => {
      result.current.deleteNotes(["main", "test"]);
    });

    // Assert
    expect(result.current.curNote).toEqual("main");
    expect(result.current.allNotes).toEqual(["main"]);
    expect(chromeMock.storage.sync.get).toHaveBeenCalledTimes(2);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith({
      allNotes: ["main"],
      curNote: "main",
    });
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledTimes(1);
    expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith([
      "main",
      "test",
    ]);
  });
});
