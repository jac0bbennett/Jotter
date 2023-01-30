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
      if (obj.theme && obj.theme === Themes.ALT) {
        setTheme(Themes.ALT);
      } else if (obj.theme && obj.theme === Themes.JONAH) {
        setTheme(Themes.JONAH);
      } else {
        setTheme(Themes.DEFAULT);
      }
    });
  }, []);

  const setTheme = (newTheme = Themes.DEFAULT) => {
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
