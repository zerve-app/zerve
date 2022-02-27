import { ReactNode } from "react";
import { View } from "react-native";
import { ThemedText } from "./Themed";

export function PageTitle({ title }: { title: string }) {
  return (
    <View>
      <ThemedText style={{ fontSize: 32, margin: 12 }}>{title}</ThemedText>
    </View>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <ThemedText style={{ fontSize: 14, margin: 12 }}>{children}</ThemedText>
  );
}
