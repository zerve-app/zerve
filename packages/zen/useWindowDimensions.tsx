import {
  Platform,
  useWindowDimensions as useRNWindowDimensions,
} from "react-native";
import { useIsMounted } from "./useIsMounted";

export function useWindowDimensions() {
  let { width, height } = useRNWindowDimensions();
  const isMounted = useIsMounted();
  if (!isMounted) {
    // on web server side we don't know the dimensions, so we assume a width that is wide enough to display the navigation sidebar
    width = 700;
  }
  return { width, height } as const;
}
