import { ReactNode } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useColors } from "./useColorScheme";
import { ThemedText } from "./Themed";
import { bigShadow } from "./Style";
import { HStack } from "./Stack";

export function Page({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <ScrollView
      style={{
        backgroundColor: colors.backgroundDim,
        ...bigShadow,
        shadowColor: colors.text,
      }}
    >
      <SafeAreaView>{children}</SafeAreaView>
    </ScrollView>
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
