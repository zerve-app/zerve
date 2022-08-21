import React from "react";
import { ComponentProps, ReactNode } from "react";
import { ThemedText } from "./Themed";

export function Label({
  children,
  minor,
  tint,
  secondary,
  style,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  tint?: boolean;
  forId?: string;
  style?: ComponentProps<typeof ThemedText>["style"];
}) {
  return (
    <ThemedText
      secondary={secondary}
      tint={tint}
      style={[{ fontWeight: "bold", fontSize: minor ? 14 : 16 }, style]}
    >
      {children}
    </ThemedText>
  );
}
