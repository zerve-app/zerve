import React from "react";

import {
  Pressable,
  View,
  Text,
  StyleProp,
  ViewStyle,
  ColorValue,
  Platform,
  StyleSheet,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Layout from "./Layout";
import { ComponentProps, ReactNode, useRef, useState } from "react";
import { useColors } from "./useColors";
import { Spinner } from "./Spinner";
import { showErrorToast } from "./Toast";
import { Icon } from "./Icon";
import { BaseButton, State } from "react-native-gesture-handler";

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
  const iconSize = size === "sm" ? 18 : 24;
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
  onPress: null | undefined | (() => void);
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  textAlign?: "right" | "left" | "center";
  inline?: boolean;
} & ButtonContentProps;

const ButtonHitSlop = { left: 6, right: 6, top: 6, bottom: 6 };

export function Button({
  title,
  left,
  right,
  primary,
  danger,
  style,
  onPress,
  onLongPress,
  small,
  disabled,
  chromeless,
  textAlign = "center",
  inline,
  tint,
}: ButtonProps) {
  const colors = useColors();
  const pressHeight = useSharedValue(0); // 0 = inactive, 1 = began, -0.5 = pressed

  const color = danger
    ? colors.dangerText
    : primary
    ? colors.tint
    : colors.text;
  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: tint || (chromeless ? "transparent" : colors.background),
    borderWidth: chromeless ? 0 : danger || primary ? 4 : 1,
    borderColor: danger
      ? colors.dangerText
      : primary
      ? colors.tint
      : `${colors.secondaryText}33`,
    borderRadius: Layout.borderRadius,
    padding: small ? 8 : 12,
    paddingHorizontal: small ? 12 : 18,
    minHeight: small ? 30 : 50,
    ...(Platform.OS === "android"
      ? { evolution: 1 }
      : {
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: pressHeight.value * 0.25,
          shadowColor: chromeless ? undefined : "#111",
        }),
    transform: [
      { translateY: -pressHeight.value * 3 },
      { scale: 1 + pressHeight.value * 0.02 },
    ],
  }));

  const appendageProps = { color, size: small ? 18 : 24 };

  let content = (
    <Animated.View style={containerStyle}>
      <View
        style={{
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {typeof left === "function" ? left(appendageProps) : left}
        <Text
          style={{
            color,
            paddingHorizontal: 12,
            fontSize: 16,
            fontWeight: primary ? "bold" : "normal",
            flex: inline ? null : 1,
            textAlign,
          }}
        >
          {title}
        </Text>
        {typeof right === "function" ? right(appendageProps) : right}
      </View>
    </Animated.View>
  );

  if (Platform.OS === "web" && !disabled && (!!onPress || !!onLongPress)) {
    // use pressable instead of RNGH on web, to address accessibility and
    return (
      <Pressable
        style={style}
        onPress={() => {
          if (!onPress) return;
          onPress();
          pressHeight.value = withTiming(-0.5, { duration: 100 });
          setTimeout(() => {
            pressHeight.value = withTiming(0, { duration: 250 });
          }, 100);
        }}
        hitSlop={ButtonHitSlop}
        onLongPress={() => {
          if (onLongPress) {
            onLongPress();
            pressHeight.value = withTiming(-0.5, { duration: 100 });
          }
          setTimeout(() => {
            pressHeight.value = withTiming(0, { duration: 250 });
          }, 100);
        }}
        disabled={disabled}
        onResponderEnd={() => {}}
        onPressIn={() => {
          pressHeight.value = withTiming(1, { duration: 150 });
        }}
        onPressOut={() => {
          pressHeight.value = withTiming(0, { duration: 250 });
        }}
        onTouchEnd={() => {
          if (!pressBounceTimeout.current) {
            pressHeight.value = withTiming(0.5, { duration: 150 });
          }
        }}
      >
        {content}
      </Pressable>
    );
  }

  if ((onPress || onLongPress) && !disabled) {
    content = (
      <BaseButton
        hitSlop={ButtonHitSlop}
        onPress={onPress ? () => onPress() : undefined}
        onLongPress={onLongPress}
        onHandlerStateChange={(e) => {
          const { state } = e.nativeEvent;
          if (state === State.BEGAN) {
            pressHeight.value = withTiming(1, { duration: 400 });
          } else if (state === State.ACTIVE) {
            pressHeight.value = withTiming(-0.5, { duration: 100 });
          } else if (state === State.END) {
            setTimeout(() => {
              pressHeight.value = withTiming(0, { duration: 250 });
            }, 100);
          } else {
            pressHeight.value = withTiming(0, { duration: 250 });
          }
        }}
      >
        {content}
      </BaseButton>
    );
  }

  return content;
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
      right={error ? <Icon name="warning" danger /> : promise && <Spinner />}
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

export type ButtonContentProps = {
  left?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  right?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  title: string;
  small?: boolean;
  chromeless?: boolean;
  danger?: boolean;
  primary?: boolean;
  tint?: ColorValue | null;
  textAlign?: "right" | "left" | "center";
};
export function ButtonContent({
  title,
  small,
  chromeless,
  danger,
  primary,
  left,
  right,
  tint,
  textAlign = "center",
}: ButtonContentProps) {
  const colors = useColors();
  const color = danger
    ? colors.dangerText
    : primary
    ? colors.tint
    : colors.text;
  const appendageProps = { color, size: small ? 18 : 24 };
  return (
    <View
      style={{
        backgroundColor:
          tint || (chromeless ? "transparent" : `${colors.background}88`),
        borderWidth: chromeless ? 0 : danger || primary ? 4 : 1,
        borderColor: danger
          ? colors.dangerText
          : primary
          ? colors.tint
          : `${colors.secondaryText}33`,
        borderRadius: Layout.borderRadius,
        padding: small ? 8 : 12,
        paddingHorizontal: small ? 12 : 18,
        minHeight: small ? 30 : 50,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {typeof left === "function" ? left(appendageProps) : left}
      <Text
        style={{
          color,
          paddingHorizontal: 12,
          fontSize: 16,
          fontWeight: primary ? "bold" : "normal",
          flex: 1,
          textAlign,
        }}
      >
        {title}
      </Text>
      {typeof right === "function" ? right(appendageProps) : right}
    </View>
  );
}

export function ContentButton({
  children,
  onPress,
  disabled,
  tint,
  id,
}: {
  children: ReactNode;
  onPress?: (() => void) | null;
  disabled?: boolean;
  tint?: ColorValue | null;
  id?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!!disabled || !onPress}
      nativeID={id}
    >
      <View
        style={{
          backgroundColor: tint || `${colors.background}88`,
          borderWidth: 1,
          borderColor: `${colors.secondaryText}33`,
          borderRadius: Layout.borderRadius,
          padding: 12,
          paddingHorizontal: 18,
          minHeight: 50,
          overflow: "hidden",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}
