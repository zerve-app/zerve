import { ReactNode } from "react";
import { Spacer, Spinner, Title, useColors } from "@zerve/zen";
import { View } from "react-native";
import { BackButton } from "./BackButton";
import { Pressable } from "react-native";

export default function ScreenHeader({
  title,
  isLoading,
  backButtonCancelStyle,
  corner,
  onLongPress,
  onBack,
}: {
  title: string;
  backButtonCancelStyle?: boolean;
  isLoading?: boolean;
  corner?: ReactNode;
  onLongPress?: () => void;
  onBack?: (() => void) | null;
}) {
  const colors = useColors();
  return (
    <View style={{}}>
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: "row",
          paddingLeft: 12,
          alignItems: "center",
          paddingBottom: 12,
          minHeight: 80,
        }}
      >
        {!!onBack && (
          <BackButton cancelButton={backButtonCancelStyle} onPress={onBack} />
        )}
        <Pressable onLongPress={onLongPress}>
          <Title
            title={title}
            secondary
            style={{ flex: 1, marginVertical: 20 }}
          />
        </Pressable>
        <Spacer />
        {isLoading && <Spinner style={{ marginHorizontal: 12 }} size="large" />}
        {corner}
      </View>
    </View>
  );
}
