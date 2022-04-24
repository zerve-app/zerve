import React, { ComponentProps, ReactNode, ReactPropTypes } from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
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
        overflow: "hidden",
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

type RowLink = {
  onPress: () => void;
  onLongPress?: () => void;
  title: string;
  icon?: ComponentProps<typeof Icon>["name"];
};

export function LinkRowGroup({
  links,
}: {
  links: (RowLink & { key: string })[];
}) {
  const colors = useColors();
  return (
    <View
      style={{
        borderRadius: Layout.borderRadius,
        backgroundColor: colors.background,
        ...smallShadow,
      }}
    >
      {links.map((link, linkIndex) => {
        const { icon } = link;
        return (
          <View
            key={link.key}
            style={{
              borderBottomWidth: linkIndex === links.length - 1 ? 0 : 1,
              borderBottomColor: `${colors.secondaryText}33`,
            }}
          >
            <TouchableOpacity
              onPress={link.onPress}
              onLongPress={link.onLongPress}
              style={{
                padding: 12,
                paddingHorizontal: 18,
                minHeight: 50,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {icon && <Icon size={24} name={icon} />}
              <Text
                style={{
                  color: colors.text,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {link.title}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
