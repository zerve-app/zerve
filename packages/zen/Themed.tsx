import React, { ComponentProps } from "react";
import { View as DefaultView } from "react-native";
import { useColorScheme } from "./useColorScheme";
import { Text } from "dripsy";

import Colors from "./Colors";
import { useColors } from "./useColors";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & ComponentProps<typeof Text>;
export type ViewProps = ThemeProps & DefaultView["props"];

export function ThemedText(
  props: {
    secondary?: boolean;
    danger?: boolean;
    oneLine?: boolean;
  } & TextProps
) {
  const colors = useColors();
  const { sx, lightColor, darkColor, ...otherProps } = props;
  const color = props.danger
    ? colors.dangerText
    : props.secondary
    ? colors.secondaryText
    : colors.text;
  return (
    <Text
      numberOfLines={props.oneLine ? 1 : undefined}
      ellipsizeMode="tail"
      sx={{ color, ...sx }}
      {...otherProps}
    />
  );
}

export function ThemedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
