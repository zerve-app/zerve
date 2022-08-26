import { ComponentProps } from "react";
import { Text, View } from "react-native";
import { Icon } from "./Icon";
import Layout from "./Layout";
import { useAllColors } from "./useColors";

export function Notice({
  message,
  danger,
  primary,
  icon,
}: {
  message: string;
  danger?: boolean;
  primary?: boolean;
  icon?: ComponentProps<typeof Icon>["name"];
}) {
  const colors = useAllColors();
  const backgroundColor = danger
    ? colors.active.dangerText
    : primary
    ? colors.active.tint
    : colors.inverted.background;
  const textColor = colors.inverted.text;
  return (
    <View
      style={{
        backgroundColor,
        borderRadius: Layout.borderRadius,
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
      }}
    >
      {icon && <Icon name={icon} color={textColor} />}
      <Text style={{ color: textColor, marginLeft: 12, fontSize: 16 }}>
        {message}
      </Text>
    </View>
  );
}
