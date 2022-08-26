import React, { ComponentProps } from "react";
import { Text } from "react-native";

import { useColors } from "./useColors";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & ComponentProps<typeof Text>;

export function ThemedText(
  props: {
    secondary?: boolean;
    danger?: boolean;
    oneLine?: boolean;
    tint?: boolean;
  } & TextProps,
) {
  const colors = useColors();
  const { lightColor, darkColor, style, ...otherProps } = props;
  const color = props.tint
    ? colors.tint
    : props.danger
    ? colors.dangerText
    : props.secondary
    ? colors.secondaryText
    : colors.text;

  return (
    <Text
      numberOfLines={props.oneLine ? 1 : undefined}
      ellipsizeMode="tail"
      style={[{ color }, style]}
      {...otherProps}
    />
  );
}
