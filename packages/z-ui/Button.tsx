import { Pressable, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Layout from "./Layout";
import { ReactNode, useRef } from "react";
import { useColors } from "./useColorScheme";
import { smallShadow } from "./Style";

export function IconButton({
  icon,
  onPress,
  altTitle,
  color,
}: {
  icon: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  altTitle: string;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  const finalColor = color || colors.lightText;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {}}
      accessibilityLabel={altTitle}
    >
      <View style={{ padding: 12 }}>
        {typeof icon === "function"
          ? icon({ color: finalColor, size: 24 })
          : icon}
      </View>
    </Pressable>
  );
}

export function Button({
  title,
  left,
  right,
  primary,
  danger,
  onPress,
  border,
}: {
  left?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  right?: ReactNode | ((opts: { color: string; size: number }) => ReactNode);
  title: string;
  primary?: boolean;
  danger?: boolean;
  onPress: () => void;
  border?: number;
}) {
  const colors = useColors();
  const pressHeight = useSharedValue(0.5); // 0.5 = inactive, 1 = hover/active, 0 = pressed
  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: primary ? colors.tint : colors.background,
    borderWidth: border,
    borderColor: colors.text,
    borderRadius: Layout.borderRadius,
    padding: 12,
    paddingHorizontal: 18,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    ...smallShadow,
    shadowOpacity: pressHeight.value * 0.25,
    transform: [{ translateY: -pressHeight.value * 3 }],
  }));
  const pressBounceTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
  const color = danger ? colors.dangerText : colors.text;
  const appendageProps = { color, size: 24 };

  return (
    <Pressable
      onPress={() => {
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
            flex: 1,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        {typeof right === "function" ? right(appendageProps) : right}
      </Animated.View>
    </Pressable>
  );
}
