import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, TextStyle, View } from "react-native";
import { useColors } from "./useColors";
import { ThemedText } from "./Themed";

export function Title({ title, style }: { title: string; style?: TextStyle }) {
  return (
    <ThemedText
      style={[
        {
          fontWeight: "bold",
          fontSize: 28,
        },
        style,
      ]}
    >
      {title}
    </ThemedText>
  );
}

export function PageTitle({ title }: { title: string }) {
  return (
    <View>
      <Title
        style={{
          fontSize: 42,
          margin: 12,
          marginBottom: 24,
        }}
        title={title}
      />
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
  minor,
  secondary,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <ThemedText
      secondary={secondary}
      style={[{ fontWeight: "bold", fontSize: minor ? 14 : 16 }, style]}
    >
      {children}
    </ThemedText>
  );
}

export function Paragraph({
  children,
  style,
  danger,
  secondary,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  danger?: boolean;
  secondary?: boolean;
}) {
  return (
    <ThemedText
      style={[
        {
          fontSize: 14,
          margin: 12,
        },
        style,
      ]}
      danger={danger}
      secondary={secondary}
    >
      {children}
    </ThemedText>
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
