import { ReactNode, useCallback } from "react";
import { Linking, Text } from "react-native";
import { useColors } from "./useColors";

export function TextLink({
  href,
  children,
  onPress,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }
    Linking.openURL(href);
  }, [href, onPress]);
  return (
    <Text onPress={handlePress} style={{ color: colors.tint }}>
      {children}
    </Text>
  );
}
