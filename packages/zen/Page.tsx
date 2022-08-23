import React, { ReactNode } from "react";
import { View } from "react-native";
import { ThemedText } from "./Themed";

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

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <View style={{ backgroundColor: "#ebebeb", flex: 1 }}>{children}</View>
  );
}

export function DemoPageContainer({
  children,
  isLoading,
  error,
}: {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null | undefined;
}) {
  return (
    <PageContainer>
      <View
        style={{
          alignSelf: "stretch",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          backgroundColor: "white",
          margin: 32,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          maxWidth: 700,
          flexDirection: "row",
        }}
      >
        {error && <ThemedText danger>{error}</ThemedText>}
        <View style={{ flex: 1, alignSelf: "stretch" }}>{children}</View>
      </View>
    </PageContainer>
  );
}
