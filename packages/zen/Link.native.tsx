import React, { ReactNode } from "react";
import { Pressable } from "react-native";

export function Link({
  href,
  children,
  nativePress,
}: {
  href: string;
  children: ReactNode;
  nativePress: () => void;
}) {
  return <Pressable onPress={nativePress}>{children}</Pressable>;
}
