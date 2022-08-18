import { ReactNode } from "react";
import { TextStyle } from "react-native";
import { ThemedText } from "./Themed";

export function Label({
  children,
  minor,
  tint,
  secondary,
  forId,
  style,
}: {
  children: ReactNode;
  secondary?: boolean;
  minor?: boolean;
  tint?: boolean;
  forId?: string;
  style?: TextStyle;
}) {
  return (
    <label htmlFor={forId}>
      <ThemedText
        secondary={secondary}
        tint={tint}
        style={[{ fontWeight: "bold", fontSize: minor ? 14 : 16 }, style]}
      >
        {children}
      </ThemedText>
    </label>
  );
}
