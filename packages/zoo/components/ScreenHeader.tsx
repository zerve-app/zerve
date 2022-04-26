import React, { ReactNode } from "react";
import { Spinner, Title } from "@zerve/ui";
import { View } from "react-native";
import { BackButton } from "./BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "react-native";

export default function ScreenHeader({
  title,
  isLoading,
  backButtonCancelStyle,
  corner,
  onLongPress,
}: {
  title: string;
  backButtonCancelStyle?: boolean;
  isLoading?: boolean;
  corner?: ReactNode;
  onLongPress?: () => void;
}) {
  const { top, left, right } = useSafeAreaInsets();
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
          <BackButton />
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
