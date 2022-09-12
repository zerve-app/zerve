import { FontAwesome } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ColorValue } from "react-native";
import { useColors } from "./useColors";

export function Icon({
  name,
  color,
  danger,
  primary,
  size = 24,
}: {
  name: ComponentProps<typeof FontAwesome>["name"];
  color?: ColorValue;
  size?: number;
  primary?: boolean;
  danger?: boolean;
}) {
  const colors = useColors();
  const defaultColor = danger
    ? colors.dangerText
    : primary
    ? colors.tint
    : colors.text;
  return <FontAwesome size={size} color={color || defaultColor} name={name} />;
}
