import { ReactNode } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useColors } from "./useColorScheme";
import { ThemedText } from "./Themed";

export function Page({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <ScrollView style={{ backgroundColor: colors.backgroundDim }}>
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
