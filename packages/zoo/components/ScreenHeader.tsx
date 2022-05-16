import React, { ReactNode } from "react";
import { Spinner, Title } from "@zerve/zen";
import { View } from "react-native";
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
}: {
  title: string;
  hideBackButton?: boolean;
  backButtonCancelStyle?: boolean;
  isLoading?: boolean;
  corner?: ReactNode;
  onLongPress?: () => void;
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
          {!hideBackButton && (
            <BackButton cancelButton={backButtonCancelStyle} />
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
            <Title title={title} style={{ flex: 1 }} />
          </Pressable>
          {corner}
        </View>
      </View>
    </View>
  );
}
