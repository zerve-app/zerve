import React, { ReactNode } from "react";
import { Spinner, Title } from "@zerve/zen";
import { View } from "dripsy";
import { BackButton } from "./BackButton";
import { Pressable } from "react-native";
import { useSafeArea } from "../provider/SafeArea/useSafeArea";

export default function ScreenHeader({
  title,
  isLoading,
  hideBackButton,
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
  const { top, left, right } = useSafeArea();
  return (
    <View
      style={{
        paddingTop: top,
        paddingLeft: left,
        paddingRight: right,
      }}
    >
      <View style={{}}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {!!onBack && (
            <BackButton cancelButton={backButtonCancelStyle} onPress={onBack} />
          )}
          {isLoading && <Spinner style={{ marginHorizontal: 12 }} />}
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 12,
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingBottom: 12,
          }}
        >
          <Pressable onLongPress={onLongPress}>
            <Title title={title} sx={{ flex: 1 }} />
          </Pressable>
          {corner}
        </View>
      </View>
    </View>
  );
}
