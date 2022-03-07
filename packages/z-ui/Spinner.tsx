import { ActivityIndicator } from "react-native";
import React from "react";
import { useColors } from "./useColors";

export function Spinner() {
  const colors = useColors();
  return <ActivityIndicator size="small" color={colors.text} />;
}
