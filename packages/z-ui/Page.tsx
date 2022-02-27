import { ReactNode } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { ThemedText } from "./Themed";

export function Page({ children }: { children: ReactNode }) {
  return (
    <ScrollView>
      <SafeAreaView>{children}</SafeAreaView>
    </ScrollView>
  );
}

export function PageSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{}}>
      <ThemedText
        style={{ marginHorizontal: 12, marginVertical: 4, fontWeight: "bold" }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );
}
