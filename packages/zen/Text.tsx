import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, TextStyle, View } from "react-native";
import { useColors } from "./useColors";
import { ThemedText } from "./Themed";

export function Title({ title, sx }: { title: string; sx?: TextStyle }) {
  return (
    <ThemedText
      sx={{
        fontWeight: "bold",
        fontSize: 24,
        ...(sx || {}),
      }}
    >
      {title}
    </ThemedText>
  );
}

export function PageTitle({ title }: { title: string }) {
  return (
    <View>
      <Title
        sx={{
          fontSize: 30,
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
    <ThemedText sx={{ fontWeight: "bold", fontSize: 14 }}>
      {children}
    </ThemedText>
  );
}

export function Label({
  children,
  sx,
  minor,
  tint,
  secondary,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  tint?: boolean;
  sx?: StyleProp<TextStyle>;
}) {
  return (
    <ThemedText
      secondary={secondary}
      tint={tint}
      sx={{ fontWeight: "bold", fontSize: minor ? 14 : 16, ...(sx || {}) }}
    >
      {children}
    </ThemedText>
  );
}

export function Paragraph({
  children,
  sx,
  danger,
  secondary,
}: {
  children: ReactNode;
  sx?: StyleProp<TextStyle>;
  danger?: boolean;
  secondary?: boolean;
}) {
  return (
    <ThemedText
      style={{
        fontSize: 14,
        margin: 12,
        ...(sx || {}),
      }}
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
