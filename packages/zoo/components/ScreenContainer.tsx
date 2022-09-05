import { ToastPresenter, useColors } from "@zerve/zen";
import { BottomSheetProvider } from "@zerve/zen";
import { bigShadow } from "@zerve/zen/Style";
import { ReactNode } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { insetsPadding } from "@zerve/zen/InsetUtils";

export default function ScreenContainer({
  children,
  scroll,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const containedChildren = scroll ? (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundDim,
        // ...bigShadow, // disabled because it does not seem to actually appear on ScreenContainer's ScrollView (when swiping back on iOS)
        borderLeftWidth: 1,
        borderColor: "#ccc",
        shadowColor: colors.text,
      }}
      contentContainerStyle={insetsPadding(insets)}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={{
        flex: 1,
        // ...bigShadow, // disabled because it does not seem to actually appear on ScreenContainer's ScrollView (when swiping back on iOS)
        backgroundColor: colors.backgroundDim,
        borderLeftWidth: 1,
        marginLeft: -1,
        borderColor: "#ccc",
      }}
    >
      {children}
    </View>
  );
  return (
    <BottomSheetProvider>
      {containedChildren}
      {Platform.OS === "android" ? <ToastPresenter /> : null}
    </BottomSheetProvider>
  );
}
