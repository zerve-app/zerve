import { createContext, ReactNode, useContext, useMemo } from "react";
import { ColorValue } from "react-native";
import { multiplyColors } from "./ColorMath";
import Colors, { ColorTheme } from "./Colors";
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
  const wouldBeDark = useColorScheme() === "dark";
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

export function useEnhancedColors(colors: ColorTheme) {
  return useMemo(
    () => ({
      ...colors,
      activeChangedTint: multiplyColors(
        colors.changedTint,
        colors.activeTint,
      ) as ColorValue,
    }),
    [colors.changedTint, colors.activeTint],
  );
}

export function useTint(isChanged: boolean, isActive?: boolean) {
  const colors = useColors();
  const enhanced = useEnhancedColors(colors);
  if (isChanged) {
    if (isActive) return enhanced.activeChangedTint;
    else return colors.changedTint;
  } else if (isActive) {
    return colors.activeTint;
  } else return null;
}
