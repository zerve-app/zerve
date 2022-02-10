import { useCallback } from "react";
import { useState } from "react";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import Palette from "../components/Palette";
import { useKeyboardEffect } from "../stores/Keyboard";

export function PageWithPalette({
  children,
  navigator,
}: {
  children: ReactNode;
  navigator: ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [isNavigatorOpen, setNavigatorOpen] = useState(true);

  useKeyboardEffect(
    "palette",
    useCallback(() => setPaletteOpen(true), [setPaletteOpen])
  );
  return (
    <View style={{ backgroundColor: "#f0f0f0", flex: 1 }}>
      <View
        style={{
          height: 50,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
          paddingHorizontal: 18,
          paddingVertical: 7,
        }}
      >
        <Text style={{ fontSize: 28 }}>Test Title</Text>
      </View>

      <View style={{ flex: 1, flexDirection: "row" }}>
        <View
          style={{
            flex: 1,
            maxWidth: 400,
          }}
        >
          {navigator}
        </View>
        <View style={{ padding: 16 }}>{children}</View>
      </View>
      {paletteOpen && (
        <Palette
          onClose={() => {
            setPaletteOpen(false);
          }}
        />
      )}
    </View>
  );
}
