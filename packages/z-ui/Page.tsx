import React, { ReactNode } from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "./useColors";
import { ThemedText } from "./Themed";
import { bigShadow } from "./Style";
import { BottomSheetProvider } from "./BottomSheet";

export function Page({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <BottomSheetProvider>
      <ScrollView
        style={{
          backgroundColor: colors.backgroundDim,
          ...bigShadow,
          shadowColor: colors.text,
        }}
      >
        <SafeAreaView>{children}</SafeAreaView>
      </ScrollView>
    </BottomSheetProvider>
  );
}

export function PageSection({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={{}}>
      <View style={{ flexDirection: "row" }}>
        <ThemedText
          style={{
            flex: 1,
            marginHorizontal: 12,
            marginVertical: 4,
            marginTop: 12,
            fontWeight: "bold",
          }}
        >
          {title}
        </ThemedText>
        {right}
      </View>
      {children}
    </View>
  );
}
