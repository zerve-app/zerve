import { Connection, ConnectionProvider } from "@zerve/query";
import { useMemo } from "react";
import { ReactNode } from "react";
import { View } from "react-native";

const staticConnection = {
  name: "nothing",
  url: "http://localhost:3888",
  key: "static",
  session: null,
} as Connection;

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
        <ConnectionProvider value={staticConnection}>
          {children}
        </ConnectionProvider>
      </View>
    </View>
  );
}
