import { useEffect, useState } from "react";
import {
  ColorSchemeName,
  useColorScheme as _useColorScheme,
} from "react-native";

export type ColorScheme = NonNullable<ColorSchemeName>;

const defaultColorScheme: ColorScheme = "dark";

type MediaQuery = {
  matches: boolean;
  addListener: (handler: (update: MediaQuery) => void) => void;
  removeListener: (handler: (update: MediaQuery) => void) => void;
};

const mediaQuery: undefined | MediaQuery = global?.window?.matchMedia(
  "(prefers-color-scheme: dark)"
);

function getAppearanceOfMQMatches(matches: undefined | boolean) {
  if (matches !== undefined) {
    return matches ? "dark" : "light";
  }
  return defaultColorScheme;
}

function getAppearance(): ColorScheme {
  return "light";
  return getAppearanceOfMQMatches(mediaQuery?.matches);
}

export function useColorScheme(): ColorScheme {
  const [appearance, setAppearance] = useState(getAppearance());
  useEffect(() => {
    function appearanceHandler(update: MediaQuery) {
      setAppearance(getAppearanceOfMQMatches(update.matches));
    }
    mediaQuery?.addListener(appearanceHandler);
    return () => {
      mediaQuery?.removeListener(appearanceHandler);
    };
  }, []);
  return appearance;
}
