import { ReactNode } from "react";
import { View } from "react-native";
import Layout from "./Layout";
import { smallShadow } from "./Style";
import { Label } from "./Text";
import { ThemedText } from "./Themed";
import { useColors } from "./useColorScheme";

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
        ...RowStyles,
        backgroundColor: colors.background,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Label style={{}}>{label}</Label>
      {children}
      {value != undefined && <ThemedText style={{}}>{value}</ThemedText>}
    </View>
  );
}
