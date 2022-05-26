import { ReactNode } from "react";
import { View } from "dripsy";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <View
      sx={{
        alignSelf: "center",
        minHeight: "100%",
      }}
    >
      <View
        sx={{
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
