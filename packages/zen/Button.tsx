import React from "react";

import { Pressable, View, Text, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Layout from "./Layout";
import { ComponentProps, ReactNode, useRef, useState } from "react";
import { useColors } from "./useColors";
import { Spinner } from "./Spinner";
import { ThemedText } from "./Themed";
import { showErrorToast } from "./Toast";
import { Button as TButton } from "tamagui";
import { smallShadow } from "./Style";

export function IconButton({
  icon,
  onPress,
  altTitle,
  color,
  size = "md",
}: {
  icon: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  altTitle: string;
  onPress: () => void;
  color?: string;
  size?: "sm" | "md";
}) {
  const colors = useColors();
  const finalColor = color || colors.secondaryText;
  const iconSize = size === "sm" ? 12 : 24;
  const padding = size === "sm" ? 8 : 12;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {}}
      accessibilityLabel={altTitle}
      hitSlop={{ left: 6, right: 6, top: 6, bottom: 6 }}
    >
      <View
        style={{
          padding,
          width: iconSize + padding * 2,
          height: iconSize + padding * 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {typeof icon === "function"
          ? icon({ color: finalColor, size: iconSize })
          : icon}
      </View>
    </Pressable>
  );
}
export type ButtonProps = {
  left?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  right?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  title: string;
  primary?: boolean;
  danger?: boolean;
  onPress?: undefined | (() => void);
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  border?: number;
  small?: boolean;
  disabled?: boolean;
  textAlign?: "right" | "left" | "center";
};
export function Button({
  title,
  left,
  right,
  primary,
  danger,
  style,
  onPress,
  onLongPress,
  border,
  small,
  disabled,
  textAlign = "center",
}: ButtonProps) {
  return <TButton onPress={onPress}>{title}</TButton>;
}

type AsyncButtonProps = Omit<ComponentProps<typeof Button>, "onPress"> & {
  onPress: () => Promise<void>;
  onCatch?: (e: any) => void;
};
export function AsyncButton({ onPress, onCatch, ...props }: AsyncButtonProps) {
  const [error, setError] = useState(null);
  const [promise, setPromise] = useState<Promise<void> | null>(null);
  return (
    <Button
      {...props}
      right={error ? <ThemedText>!!</ThemedText> : promise && <Spinner />}
      onPress={() => {
        const promise = onPress()
          .then(() => {})
          .catch((e) => {
            showErrorToast(e?.message || "Unknown Error");
            setError(e);
            onCatch?.(e);
          });
        setPromise(promise);
        promise.finally(() => {
          setPromise(null);
        });
      }}
      {...props}
    />
  );
}
