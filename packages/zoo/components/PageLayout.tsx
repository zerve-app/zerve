import { ReactNode } from "react";
import { View } from "react-native";

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
        {children}
      </View>
    </View>
  );
}
