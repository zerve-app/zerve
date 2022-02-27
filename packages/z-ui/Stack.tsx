import { ReactNode, Children } from "react";
import { View } from "react-native";

export function HStack({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", padding: 6, paddingVertical: 12 }}>
      {Children.map(children, (el) => (
        <View style={{ flex: 1, marginHorizontal: 6 }}>{el}</View>
      ))}
    </View>
  );
}

export function VStack({ children }: { children: ReactNode }) {
  return (
    <View
      style={{ flexDirection: "column", padding: 6, paddingHorizontal: 12 }}
    >
      {Children.map(children, (el) => (
        <View style={{ flex: 1, marginVertical: 6 }}>{el}</View>
      ))}
    </View>
  );
}
