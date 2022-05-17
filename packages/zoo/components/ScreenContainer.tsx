import { useColors } from "@zerve/zen";
import { BottomSheetProvider } from "@zerve/zen";
import { bigShadow } from "@zerve/zen/Style";
import React, { ReactNode } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ToastContainer } from "@zerve/zen/Toast";

export default function ScreenContainer({
  children,
  scroll,
  safe,
}: {
  children: ReactNode;
  scroll?: boolean;
  safe?: boolean;
}) {
  const colors = useColors();
  const childrenWithScroll = scroll ? (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundDim,
        ...bigShadow,
        shadowColor: colors.text,
      }}
    >
      {safe ? <SafeAreaView>{children}</SafeAreaView> : children}
    </ScrollView>
  ) : (
    children
  );
  return (
    <ToastContainer>
      <BottomSheetProvider>{childrenWithScroll}</BottomSheetProvider>
    </ToastContainer>
  );
}
