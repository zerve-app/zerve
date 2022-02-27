import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { ThemedText } from "./Themed";
import Layout from "./Layout";
import { ReactNode } from "react";
import { useColors } from "./useColorScheme";

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
  onPress,
  border,
}: {
  left?: ReactNode;
  right?: ReactNode;
  title: string;
  onPress: () => void;
  border?: number;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} onPressIn={() => {}}>
      <Animated.View
        style={{
          backgroundColor: colors.background,
          borderWidth: border,
          borderColor: colors.text,
          borderRadius: Layout.borderRadius,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {left}
        <ThemedText
          style={{
            paddingHorizontal: 12,
            fontSize: 16,
            flex: 1,
            textAlign: "center",
          }}
        >
          {title}
        </ThemedText>
        {right}
      </Animated.View>
    </Pressable>
  );
}
