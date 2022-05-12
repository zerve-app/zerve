import React, { ReactNode, Children } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export function HStack({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", padding: 6, paddingVertical: 12 }}>
      {Children.map(children, (el) => (
        <View style={{ flex: 1, marginHorizontal: 6 }}>{el}</View>
      ))}
    </View>
  );
}

export function VStack({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        { flexDirection: "column", padding: 6, paddingHorizontal: 12 },
        style,
      ]}
    >
      {Children.map(children, (el) => (
        <View style={{ flex: 1, marginVertical: 6 }}>{el}</View>
      ))}
    </View>
  );
}
