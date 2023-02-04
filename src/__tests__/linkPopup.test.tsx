import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import LinkPopup from "../components/linkPopup";
import { LinkInfo } from "../types";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { Dispatch, SetStateAction } from "react";

describe("LinkPopup", () => {
  let linkInfo: LinkInfo;
  const setLinkInfo: Dispatch<SetStateAction<LinkInfo>> = vi.fn();
  const setNote: Dispatch<SetStateAction<string>> = vi.fn();
  let notepadRef: React.RefObject<HTMLDivElement>;
  const setShowLinkPopup: Dispatch<SetStateAction<boolean>> = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    cleanup();

    const el = document.createElement("div");

    const el2 = document.createElement("a");
    el2.href = "https://www.google.com";
    el2.textContent = "Google";
    el.appendChild(el2);

    notepadRef = {
      current: el,
    };

    linkInfo = {
      top: 0,
      target: el2,
      text: "Google",
      url: "https://www.google.com",
    };
  });

  const renderComponent = () => {
    return render(
      <LinkPopup
        linkInfo={linkInfo}
        setLinkInfo={setLinkInfo}
        setNote={setNote}
        notepadRef={notepadRef}
        setShowLinkPopup={setShowLinkPopup}
      />
    );
  };

  it("should render", () => {
    // Arrange

    // Act
    const { getByTestId } = renderComponent();

    // Assert
    expect(getByTestId("link-popup")).toBeTruthy();
    expect(getByTestId("link-popup-link").textContent).toBe(
      "https://www.google.com"
    );
  });

  it("should show empty inputs when linkInfo.target is null", () => {
    // Arrange
    linkInfo.target = null;

    // Act
    const { getByTestId } = renderComponent();

    // Assert
    expect(
      (getByTestId("link-popup-text-input") as HTMLInputElement).value
    ).toBe("");
    expect(
      (getByTestId("link-popup-url-input") as HTMLInputElement).textContent
    ).toBe("");
  });

  it("should show inputs with content when edit button is clicked", () => {
    // Arrange

    // Act
    const { getByTestId } = renderComponent();
    fireEvent.click(getByTestId("link-popup-edit-button"));

    // Assert
    expect(
      (getByTestId("link-popup-text-input") as HTMLInputElement).value
    ).toBe("Google");
    expect(
      (getByTestId("link-popup-url-input") as HTMLInputElement).value
    ).toBe("https://www.google.com");
  });

  it("should call setNote when save button is clicked", () => {
    // Arrange
    const { getByTestId } = renderComponent();
    fireEvent.click(getByTestId("link-popup-edit-button"));
    fireEvent.change(getByTestId("link-popup-text-input"), {
      target: { value: "Facebook" },
    });
    fireEvent.change(getByTestId("link-popup-url-input"), {
      target: { value: "https://www.facebook.com" },
    });

    // Act
    fireEvent.click(getByTestId("link-popup-save-button"));

    // Assert
    expect(setNote).toBeCalledWith(
      '<a href="https://www.facebook.com">Facebook</a>'
    );
  });
});
