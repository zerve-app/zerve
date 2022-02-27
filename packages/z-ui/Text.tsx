import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "./useColorScheme";
import { ThemedText } from "./Themed";

export function PageTitle({ title }: { title: string }) {
  return (
    <View>
      <ThemedText
        style={{
          fontSize: 42,
          margin: 12,
          fontWeight: "bold",
          marginBottom: 24,
        }}
      >
        {title}
      </ThemedText>
    </View>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <ThemedText style={{ fontSize: 14, margin: 12 }}>{children}</ThemedText>
  );
}

export function Separator({}: {}) {
  const colors = useColors();
  return (
    <View
      style={{
        alignSelf: "stretch",
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          backgroundColor: colors.lightText,
          height: StyleSheet.hairlineWidth,
        }}
      />
    </View>
  );
}
