import { SavedConnection, SavedConnectionProvider } from "@zerve/query";
import { useMemo } from "react";
import { ReactNode } from "react";
import { View } from "react-native";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        alignSelf: "center",
        minHeight: "100%",
      }}
    >
      <View
        style={{
          minHeight: "100%",
          padding: 20,
          paddingTop: 80,
          width: 600,
          backgroundColor: "#eee",
        }}
      >
        <ConnectionKeyProvider value={"dev"}>{children}</ConnectionKeyProvider>
      </View>
    </View>
  );
}
