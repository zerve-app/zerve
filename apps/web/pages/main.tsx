import Head from "next/head";
import { useCallback } from "react";
import { useState } from "react";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import { Button } from "ui";

import Palette from "../components/Palette";
import { useKeyboardEffect } from "../tools/Keyboard";

function IndexDoc() {
  return (
    <>
      <Text>Blocks</Text>
      <Text>File System</Text>
      <Text>Ref</Text>
    </>
  );
}

function PageWithPalette({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useKeyboardEffect(
    "palette",
    useCallback(() => setPaletteOpen(true), [setPaletteOpen])
  );
  return (
    <View style={{ backgroundColor: "#f0f0f0", flex: 1 }}>
      {paletteOpen && (
        <Palette
          onClose={() => {
            setPaletteOpen(false);
          }}
        />
      )}
      {children}
    </View>
  );
}

export default function Web() {
  return (
    <PageWithPalette>
      <Head>
        <title>Agent App</title>
      </Head>
      <IndexDoc />
    </PageWithPalette>
  );
}
