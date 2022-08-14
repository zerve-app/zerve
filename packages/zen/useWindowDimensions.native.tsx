import { useWindowDimensions as useRNWindowDimensions } from "react-native";

export function useWindowDimensions() {
  // special case is a web problem only, see useWindowDimensions.tsx
  return useRNWindowDimensions();
}
