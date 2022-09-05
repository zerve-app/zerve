import { ToastPresenter, useColors } from "@zerve/zen";
import { BottomSheetProvider } from "@zerve/zen";
import { bigShadow } from "@zerve/zen/Style";
import { ReactNode } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenContainer({
  children,
  scroll,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const childrenWithScroll = scroll ? (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundDim,
        shadowColor: colors.text,
        ...bigShadow,
      }}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{}}>{children}</View>
  );
  return (
    <BottomSheetProvider>
      {childrenWithScroll}
      {Platform.OS === "android" ? <ToastPresenter /> : null}
    </BottomSheetProvider>
  );
}
