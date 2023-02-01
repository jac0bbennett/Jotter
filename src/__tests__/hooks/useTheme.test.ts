import { useTheme } from "./../../hooks/useTheme";
import { Themes } from "./../../types";
import { renderHook } from "@testing-library/react";
import { chromeMock } from "./../utils/mockChrome";
import { act } from "react-dom/test-utils";

describe("useTheme", () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.chrome = chromeMock as any;

    Object.defineProperty(global.document, "documentElement", {
      writable: true,
      value: document.createElement("div"),
    });
  });

  it("should return the default theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Themes.DEFAULT);
  });

  it("should already be set to alt theme", () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.local, "get")
      .mockImplementation((key, callback) => {
        callback({ theme: Themes.ALT });
      });

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe(Themes.ALT);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: "icon48alt.png",
    });
    expect(document.body.getAttribute("data-theme")).toBe("alt");
  });

  it("should already be set to jonah theme", () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.local, "get")
      .mockImplementation((key, callback) => {
        callback({ theme: Themes.JONAH });
      });

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe(Themes.JONAH);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: "icon48jonah.png",
    });
    expect(document.body.getAttribute("data-theme")).toBe("jonah");
  });

  it("should set the theme to default", () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.local, "get")
      .mockImplementation((key, callback) => {
        callback({ theme: Themes.ALT });
      });
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => {
      result.current.setTheme(Themes.DEFAULT);
    });

    // Assert
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      theme: Themes.DEFAULT,
    });
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: "icon48.png",
    });
    expect(document.body.getAttribute("data-theme")).toBe("default");
  });

  it("should set the theme to alt", () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.local, "get")
      .mockImplementation((key, callback) => {
        callback({});
      });

    const { result } = renderHook(() => useTheme());

    // Act
    act(() => {
      result.current.setTheme(Themes.ALT);
    });

    // Assert
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      theme: Themes.ALT,
    });
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: "icon48alt.png",
    });
    expect(document.body.getAttribute("data-theme")).toBe("alt");
  });

  it("should set the theme to jonah", () => {
    // Arrange
    jest
      .spyOn(chromeMock.storage.local, "get")
      .mockImplementation((key, callback) => {
        callback({});
      });

    const { result } = renderHook(() => useTheme());

    // Act
    act(() => {
      result.current.setTheme(Themes.JONAH);
    });

    // Assert
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      theme: Themes.JONAH,
    });
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: "icon48jonah.png",
    });
    expect(document.body.getAttribute("data-theme")).toBe("jonah");
  });
});
