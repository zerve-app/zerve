import { AppState } from "react-native";
import { focusManager } from "react-query";

export function initFocusManager() {
  // from https://tanstack.com/query/v4/docs/guides/window-focus-refetching#managing-focus-in-react-native
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener("change", (state) => {
      handleFocus(state === "active");
    });
    return () => {
      subscription.remove();
    };
  });
}
