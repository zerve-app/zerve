import { ReactNode } from "react";
import { StyleProp, StyleSheet, View } from "react-native";
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

export function SmallSectionTitle({ children }: { children: ReactNode }) {
  return (
    <ThemedText style={{ fontWeight: "bold", fontSize: 14 }}>
      {children}
    </ThemedText>
  );
}

export function Label({
  children,
  style,
  secondary,
}: {
  children: ReactNode;
  secondary?: boolean;
  style?: StyleProp<Text>;
}) {
  return (
    <ThemedText
      secondary={secondary}
      style={[{ fontWeight: "bold", fontSize: 16 }, style]}
    >
      {children}
    </ThemedText>
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
          backgroundColor: colors.secondaryText,
          height: StyleSheet.hairlineWidth,
        }}
      />
    </View>
  );
}
