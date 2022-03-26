import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from ".";
import Layout from "./Layout";
import { smallShadow } from "./Style";
import { useColors } from "./useColors";

export function Card({
  children,
  title,
  secondary,
}: {
  children: ReactNode;
  title: string;
  secondary?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        borderColor: `${colors.secondaryText}33`,
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.background,
        paddingHorizontal: Layout.paddingHorizontal,
        paddingVertical: Layout.paddingVertical,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: Layout.paddingVertical,
        }}
      >
        <ThemedText style={{ fontWeight: "bold" }}>{title}</ThemedText>
        <ThemedText secondary>{secondary}</ThemedText>
      </View>
      {children}
    </View>
  );
}
