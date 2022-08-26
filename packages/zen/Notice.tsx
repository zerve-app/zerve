import { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";
import { Icon } from "./Icon";
import Layout from "./Layout";
import { useAllColors, Invert } from "./useColors";

export function Notice({
  message,
  danger,
  primary,
  icon,
  children,
}: {
  message: string;
  danger?: boolean;
  primary?: boolean;
  icon?: ComponentProps<typeof Icon>["name"];
  children?: ReactNode;
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
        padding: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: !!children ? 12 : 0,
        }}
      >
        {icon && <Icon name={icon} color={textColor} />}
        <Text style={{ color: textColor, marginLeft: 12, fontSize: 16 }}>
          {message}
        </Text>
      </View>
      {children && <Invert>{children}</Invert>}
    </View>
  );
}
