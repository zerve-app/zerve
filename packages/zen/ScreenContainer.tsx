import { ReactNode, useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { AnimatePresence } from "moti";
import { useColors } from "./useColors";
import { useColorScheme } from "./useColorScheme";
import { ToastPresenter } from "./Toast";
import { bigShadow } from "./Style";
import { NestableScrollContainer } from "react-native-draggable-flatlist";

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
  useEffect(() => {
    if (!footer) setFooterHeight(0);
  }, [!!footer]);
  const scheme = useColorScheme();
  return (
    <>
      <NestableScrollContainer
        style={{
          flex: 1,
          backgroundColor: colors.backgroundDim,
          ...bigShadow, // disabled because it does not seem to actually appear on ScreenContainer's ScrollView (when swiping back on iOS)
          borderLeftWidth: 1,
          borderColor: `${colors.secondaryText}33`,
          shadowColor: colors.text,
        }}
        scrollIndicatorInsets={{
          bottom: Math.max(footerHeight - insets.bottom + 14, 14),
          // bottom: insets.bottom,
          top: 5,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            minHeight: "100%",
            paddingTop: insets.top,
            paddingBottom: !!footer ? footerHeight : insets.bottom,
          }}
        >
          {children}
        </View>
      </NestableScrollContainer>
      <BlurView // behind status bar
        tint={scheme}
        style={{
          position: "absolute",
          top: 0,
          left: 1,
          right: 0,
          height: insets.top,
        }}
      />
      <AnimatePresence>
        {footer && (
          <MotiView
            from={{
              translateY: 200,
            }}
            animate={{
              translateY: 0,
            }}
            exit={{
              translateY: 200,
            }}
            transition={{
              type: "timing",
            }}
          >
            <BlurView
              style={{
                position: "absolute",
                left: 1,
                right: 0,
                bottom: 0,
                paddingBottom: footer ? insets.bottom : 0,
              }}
              tint={scheme}
              onLayout={(e) => {
                const { height } = e.nativeEvent.layout;
                setFooterHeight(height);
              }}
            >
              {footer}
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>
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
        borderColor: `${colors.secondaryText}33`,
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
