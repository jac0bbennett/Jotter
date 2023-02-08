import { vi } from "vitest";
import { ThemeState } from "../../hooks/useTheme";
import { Themes } from "../../types";

export const mockTheme: ThemeState = {
  theme: Themes.DEFAULT,
  setTheme: vi.fn(),
};
