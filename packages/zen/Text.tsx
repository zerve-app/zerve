import React, { ComponentProps, ReactNode } from "react";
import { StyleProp, StyleSheet, TextStyle, View } from "react-native";
import { useColors } from "./useColors";
import { ThemedText } from "./Themed";

export function Title({
  title,
  style,
  ...themedTextProps
}: {
  title: string;
  style?: TextStyle;
} & ComponentProps<typeof ThemedText>) {
  return (
    <ThemedText
      {...themedTextProps}
      style={[
        {
          fontWeight: "bold",
          fontSize: 24,
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
    <ThemedText style={{ fontWeight: "bold", fontSize: 14 }}>
      {children}
    </ThemedText>
  );
}

export function Paragraph({
  children,
  danger,
  secondary,
}: {
  children: ReactNode;
  danger?: boolean;
  secondary?: boolean;
}) {
  return (
    <ThemedText
      style={{
        fontSize: 14,
        margin: 12,
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
