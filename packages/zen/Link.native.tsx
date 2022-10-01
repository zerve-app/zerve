import { ReactNode, useCallback } from "react";
import { Linking, Pressable } from "react-native";

export function Link({
  href,
  children,
  onPress,
}: {
  href: string;
  children: ReactNode;
  onPress?: () => void;
}) {
  const handlePress = useCallback(() => {
    return (
      onPress ||
      (() => {
        Linking.openURL(href);
      })
    );
  }, [onPress, href]);
  return <Pressable onPress={handlePress}>{children}</Pressable>;
}
