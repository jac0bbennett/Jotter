import { Themes, THEME_KEY } from "./../types";
import { useEffect, useMemo, useState } from "react";
import * as chromeApi from "../api/chrome";

export type ThemeState = {
  theme: Themes | null;
  setTheme: (newTheme: Themes) => void;
};

export const useTheme = (): ThemeState => {
  const [theme, setCurrentTheme] = useState<Themes>(Themes.DEFAULT);

  useEffect(() => {
    chrome.storage.local.get(THEME_KEY, (obj) => {
      switch (obj.theme) {
        case Themes.ALT:
          setTheme(Themes.ALT);
          break;
        case Themes.JONAH:
          setTheme(Themes.JONAH);
          break;
        default:
          setTheme(Themes.DEFAULT);
          break;
      }
    });
  }, []);

  const setTheme = (newTheme: Themes) => {
    chromeApi.setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  return useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );
};
