import { ReactNode } from "react";
import { ThemedText } from "./Themed";

export function Label({
  children,
  minor,
  tint,
  secondary,
  forId,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  tint?: boolean;
  forId?: string;
}) {
  return (
    <label htmlFor={forId}>
      <ThemedText
        secondary={secondary}
        tint={tint}
        style={{ fontWeight: "bold", fontSize: minor ? 14 : 16 }}
      >
        {children}
      </ThemedText>
    </label>
  );
}
