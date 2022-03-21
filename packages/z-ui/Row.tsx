import React, { ComponentProps, ReactNode, ReactPropTypes } from "react";
import { View } from "react-native";
import { Button } from "./Button";
import { Icon } from "./Icon";
import Layout from "./Layout";
import { smallShadow } from "./Style";
import { Label } from "./Text";
import { ThemedText } from "./Themed";
import { useColors } from "./useColors";

export const RowStyles = {
  ...smallShadow,
  borderRadius: Layout.borderRadius,
  padding: 12,
};

export const marginHInset = {
  marginLeft: Layout.paddingHorizontal,
  marginRight: Layout.paddingHorizontal,
};
export const marginVInset = {
  marginTop: Layout.paddingVertical,
  marginBottom: Layout.paddingVertical,
};

export function InfoRow({
  label,
  value,
  children,
}: {
  value?: string;
  label: string;
  children?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        // ...RowStyles,
        // backgroundColor: colors.background,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Label style={{}} secondary minor>
        {label}
      </Label>
      {children}
      {value != undefined && <ThemedText style={{}}>{value}</ThemedText>}
    </View>
  );
}

export function LinkRow({
  onPress,
  title,
  icon,
}: {
  onPress: () => void;
  title: string;
  icon?: ComponentProps<typeof Icon>["name"];
}) {
  return (
    <Button
      textAlign="left"
      onPress={onPress}
      title={title}
      left={icon ? (p) => <Icon {...p} name={icon} /> : null}
    />
  );
}
