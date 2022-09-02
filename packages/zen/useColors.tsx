import { createContext, ReactNode, useContext, useMemo } from "react";
import Colors from "./Colors";
import { useColorScheme } from "./useColorScheme";

const ColorInversionContext = createContext<boolean>(false);

export function Invert({ children }: { children: ReactNode }) {
  const isInverted = useContext(ColorInversionContext);
  return (
    <ColorInversionContext.Provider value={!isInverted}>
      {children}
    </ColorInversionContext.Provider>
  );
}

function useInvertableColorScheme(): "light" | "dark" {
  const isInverted = useContext(ColorInversionContext);
  // const wouldBeDark = useColorScheme() === "dark";
  // SORRYFIXME! DARK MODE LOOKS UGLY NOW, OK?!
  const wouldBeDark = false;
  const isDark = isInverted ? !wouldBeDark : wouldBeDark;
  const scheme = isDark ? "dark" : "light";
  return scheme;
}

export function useColors() {
  return Colors[useInvertableColorScheme()];
}

export function useAllColors() {
  const scheme = useInvertableColorScheme();
  return useMemo(
    () => ({
      active: Colors[scheme],
      inverted: scheme === "light" ? Colors.dark : Colors.light,
      colors: Colors,
      scheme,
    }),
    [scheme],
  );
}
