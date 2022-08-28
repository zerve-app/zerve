import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { useColors } from "./useColors";

export function Spinner({
  style,
  size = "small",
}: {
  style?: StyleProp<ViewStyle>;
  size: "small" | "large";
}) {
  const colors = useColors();
  return <ActivityIndicator size={size} color={colors.text} style={style} />;
}
