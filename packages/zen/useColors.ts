import { useMemo } from "react";
import Colors from "./Colors";
import { useColorScheme } from "./useColorScheme";

export function useColors() {
  return Colors[useColorScheme()];
}

export function useAllColors() {
  const scheme = useColorScheme();
  return useMemo(
    () => ({
      active: Colors[scheme],
      inverted: scheme === "light" ? Colors.dark : Colors.light,
      colors: Colors,
      scheme,
    }),
    [scheme]
  );
}
