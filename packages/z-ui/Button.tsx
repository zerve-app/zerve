import { Pressable, View, Text, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Layout from "./Layout";
import React, { ComponentProps, ReactNode, useRef, useState } from "react";
import { useColors } from "./useColors";
import { smallShadow } from "./Style";
import { Spinner } from "./Spinner";
import { ThemedText } from "./Themed";

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
  onPress: null | (() => void);
  style?: StyleProp<ViewStyle>;
  border?: number;
  small?: boolean;
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
  border,
  small,
  textAlign = "center",
}: ButtonProps) {
  const colors = useColors();
  const pressHeight = useSharedValue(0.5); // 0.5 = inactive, 1 = hover/active, 0 = pressed

  const color = danger
    ? colors.dangerText
    : primary
    ? colors.tint
    : colors.text;
  const borderWidth = border !== undefined ? border : primary || danger ? 4 : 0;
  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.background,
    borderWidth,
    borderColor: `${color}88`,
    borderRadius: Layout.borderRadius,
    padding: small ? 8 : 12,
    paddingHorizontal: small ? 12 : 18,
    minHeight: small ? 30 : 50,
    flexDirection: "row",
    alignItems: "center",
    ...smallShadow,
    shadowOpacity: pressHeight.value * 0.25,
    transform: [{ translateY: -pressHeight.value * 3 }],
  }));
  const pressBounceTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
  const appendageProps = { color, size: small ? 18 : 24 };

  return (
    <Pressable
      style={style}
      onPress={() => {
        if (!onPress) return;
        onPress();
        pressHeight.value = withSpring(0, { mass: 0.5 });
        pressBounceTimeout.current = setTimeout(() => {
          pressHeight.value = withSpring(0.5, { mass: 0.5 });
          pressBounceTimeout.current = null;
        }, 250);
      }}
      onResponderEnd={() => {}}
      onPressIn={() => {
        pressHeight.value = withSpring(1, { mass: 0.5 });
      }}
      onTouchEnd={() => {
        if (!pressBounceTimeout.current) {
          pressHeight.value = withSpring(0.5, { mass: 0.5 });
        }
      }}
    >
      <Animated.View style={containerStyle}>
        {typeof left === "function" ? left(appendageProps) : left}
        <Text
          style={{
            color,
            paddingHorizontal: 12,
            fontSize: 16,
            fontWeight: primary ? "bold" : "normal",
            flex: small ? undefined : 1,
            textAlign,
          }}
        >
          {title}
        </Text>
        {typeof right === "function" ? right(appendageProps) : right}
      </Animated.View>
    </Pressable>
  );
}

type AsyncButtonProps = Omit<ComponentProps<typeof Button>, "onPress"> & {
  onPress: () => Promise<void>;
};
export function AsyncButton({ onPress, ...props }: AsyncButtonProps) {
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
            setError(e);
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
