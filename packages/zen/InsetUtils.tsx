import { Insets, ViewStyle } from "react-native";

export function insetsPadding(insets: Insets): ViewStyle {
  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
}
