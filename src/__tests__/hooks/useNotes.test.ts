import { RenderHookResult, renderHook, waitFor } from "@testing-library/react";
import { NotesState, useNotes } from "./../../hooks/useNotes";
import { chromeMock } from "./../utils/mockChrome";
import { act } from "react-dom/test-utils";

describe("useNotes", () => {
  beforeAll(() => {
    global.chrome = chromeMock as any;
  });

  it("should initialize new state", async () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.sync, "get")
      .mockImplementation((key: string[], callback) => {
        let resp = {} as Record<string, string | string[]>;

        callback(resp);
      });

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
      allNotes: ["main"]
    });
    expect(chromeMock.storage.sync.set).toHaveBeenCalledTimes(1);
  });

  it("should set the note content", async () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.sync, "get")
      .mockImplementation((key: string[], callback) => {
        let resp = {} as Record<string, string | string[]>;
        if (key.includes("main")) resp["main"] = "test";
        if (key.includes("curNote")) resp["curNote"] = "main";
        if (key.includes("allNotes")) resp["allNotes"] = ["main"];

        callback(resp);
      });
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
  });

  it("should sync the note content", async () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.sync, "get")
      .mockImplementation((key: string[], callback) => {
        let resp = {} as Record<string, string | string[]>;
        if (key.includes("main")) resp["main"] = "test";
        if (key.includes("curNote")) resp["curNote"] = "main";
        if (key.includes("allNotes")) resp["allNotes"] = ["main"];

        callback(resp);
      });
    const { result } = renderHook(() => useNotes());

    await act(async () => {
      result.current.setNoteContent("test and other");
    });

    // Act
    await act(async () => {
      result.current.syncNoteContent();
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
        main: "test and other"
      },
      expect.any(Function)
    );
  });

  it("should set curNote", async () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.sync, "get")
      .mockImplementation((key: string[], callback) => {
        let resp = {} as Record<string, string | string[]>;
        if (key.includes("main")) resp["main"] = "test";
        if (key.includes("curNote")) resp["curNote"] = "main";
        if (key.includes("allNotes")) resp["allNotes"] = ["main", "test"];

        callback(resp);
      });
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
  });

  it("should add a new note", async () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.sync, "get")
      .mockImplementation((key: string[], callback) => {
        let resp = {} as Record<string, string | string[]>;
        if (key.includes("main")) resp["main"] = "test";
        if (key.includes("curNote")) resp["curNote"] = "main";
        if (key.includes("allNotes")) resp["allNotes"] = ["main", "test"];

        callback(resp);
      });
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
      allNotes: ["new note", "main", "test"]
    });
  });
});
