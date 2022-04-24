import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { useColors } from "./useColors";

export function Spinner({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <ActivityIndicator size="small" color={colors.text} style={style} />;
}
