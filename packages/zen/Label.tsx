import { ReactNode } from "react";
import { ThemedText } from "./Themed";

export function Label({
  children,
  minor,
  tint,
  secondary,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  tint?: boolean;
  forId?: string;
}) {
  return (
    <ThemedText
      secondary={secondary}
      tint={tint}
      style={{ fontWeight: "bold", fontSize: minor ? 14 : 16 }}
    >
      {children}
    </ThemedText>
  );
}
