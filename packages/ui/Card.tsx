import React, { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./Themed";
import Layout from "./Layout";
import { smallShadow } from "./Style";
import { useColors } from "./useColors";

export function Card({
  children,
  title,
  secondary,
  onPress,
}: {
  children: ReactNode;
  title: string;
  secondary?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress}>
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
    </Pressable>
  );
}
