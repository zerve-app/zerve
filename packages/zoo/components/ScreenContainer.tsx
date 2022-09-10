import { ToastPresenter, useColors } from "@zerve/zen";
import { ReactNode, useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { insetsPadding } from "@zerve/zen/InsetUtils";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function ScrollWithFooter({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: null | ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const footerBottomHeightWithInset = useSharedValue(0);
  const blurFooterStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: withTiming(footerBottomHeightWithInset.value, { duration: 300 }),
  }));
  useEffect(() => {
    if (!footer) footerBottomHeightWithInset.value = 0;
  }, [!!footer]);
  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: colors.backgroundDim,
          // ...bigShadow, // disabled because it does not seem to actually appear on ScreenContainer's ScrollView (when swiping back on iOS)
          borderLeftWidth: 1,
          borderColor: "#ccc",
          shadowColor: colors.text,
        }}
        contentContainerStyle={{
          ...insetsPadding(insets),
          minHeight: "100%",
          paddingBottom: Math.max(footerHeight, insets.bottom),
        }}
        scrollIndicatorInsets={{
          bottom: Math.max(footerHeight - insets.bottom, 0),
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        {children}
      </ScrollView>
      <BlurView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
        }}
      />
      <AnimatedBlurView style={blurFooterStyle}></AnimatedBlurView>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: footer ? insets.bottom : 0,
        }}
      >
        {footer && (
          <View
            onLayout={(e) => {
              const { height } = e.nativeEvent.layout;
              footerBottomHeightWithInset.value = height + insets.bottom;
              setFooterHeight(height);
            }}
          >
            {footer}
          </View>
        )}
      </View>
    </>
  );
}

export default function ScreenContainer({
  children,
  scroll,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: null | ReactNode;
}) {
  const colors = useColors();
  const containedChildren = scroll ? (
    <ScrollWithFooter footer={footer}>{children}</ScrollWithFooter>
  ) : (
    <View
      style={{
        flex: 1,
        // ...bigShadow, // disabled because it does not seem to actually appear on ScreenContainer's ScrollView (when swiping back on iOS)
        backgroundColor: colors.backgroundDim,
        borderLeftWidth: 1,
        marginLeft: -1,
        borderColor: "#ccc",
      }}
    >
      {children}
      {footer}
    </View>
  );
  return (
    <>
      {containedChildren}
      {Platform.OS === "android" ? <ToastPresenter /> : null}
    </>
  );
}
