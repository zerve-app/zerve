import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { defineKeySource } from "@zerve/zed";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useColors } from "./useColors";
import { AbsoluteFill, bigShadow, smallShadow } from "./Style";
import { BlurView } from "expo-blur";
import { FullWindowOverlay } from "react-native-screens";

export type BottomSheetContext = {
  open: <O>(
    options: O,
    node: (opts: { onClose: () => void; options: O }) => ReactNode,
  ) => void;
  close: () => void;
};

export const BottomSheetCtx = createContext<null | BottomSheetContext>(null);

type SheetConfig = {
  key: string;
  children: ReactNode;
};

const getBottomSheetKey = defineKeySource("BottomSheet");

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [sheetConfig, setSheetConfig] = useState<null | SheetConfig>();

  const colors = useColors();
  const layerVisibility = useSharedValue(0);
  const layerStyles = useAnimatedStyle(() => ({
    ...AbsoluteFill,
    opacity: layerVisibility.value * 0.7,
    backgroundColor:
      Platform.OS === "android" ? colors.tint : colors.background,
  }));
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setIsOpen(false);
      setSheetConfig(null);
    }
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    bottomSheetRef.current?.close();
    return true;
  }, []);
  const context = useMemo(
    () => ({
      open: (
        options: any,
        renderNode: (opts: { onClose: () => void; options: any }) => ReactNode,
      ) => {
        setIsOpen(true);
        setSheetConfig({
          children: renderNode({ onClose: close, options }),
          key: getBottomSheetKey(),
        });
      },
      close,
    }),
    [setSheetConfig, close],
  );
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(useMemo(() => ["CONTENT_HEIGHT"], []));
  useEffect(() => {
    if (isOpen) {
      BackHandler.addEventListener("hardwareBackPress", context.close);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", context.close);
      };
    }
  }, [isOpen, context.close]);
  useEffect(() => {
    if (isOpen) {
      layerVisibility.value = withTiming(1, { duration: 250 });
    } else {
      layerVisibility.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen]);
  const ContentContainerView = Platform.select({
    ios: BlurView,
    default: View,
  });
  const insets = useSafeAreaInsets();
  let sheetContent = null;
  if (sheetConfig) {
    sheetContent = (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BottomSheet
          style={Platform.select({
            android: {},
            default: {
              ...bigShadow,
            },
          })}
          key={sheetConfig.key}
          enablePanDownToClose
          ref={bottomSheetRef}
          handleComponent={null}
          handleStyle={{
            backgroundColor: colors.backgroundDim,
          }}
          backgroundStyle={{
            backgroundColor: "transparent",
          }}
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          index={0}
          onChange={handleSheetChanges}
        >
          <ContentContainerView
            onLayout={handleContentLayout}
            style={{
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              ...Platform.select({
                android: {
                  backgroundColor: colors.background,
                },
                default: {},
              }),
            }}
          >
            {sheetConfig.children}
          </ContentContainerView>
        </BottomSheet>
      </View>
    );
  }
  let fadeOverlay = <Animated.View style={layerStyles} pointerEvents="none" />;
  let touchOverlay = isOpen ? (
    <Pressable style={{ ...AbsoluteFill }} onPress={context.close}>
      <View
        style={{
          ...AbsoluteFill,
          // why do we need a background color here? good question! if not for this bg color, android allows touches through to the underlying content O_o
          backgroundColor: "#ffffff01",
          // I guess RN "optimizes" this and removes the view if not for the bg color. so we make it very subtle
        }}
      />
    </Pressable>
  ) : null;

  if (Platform.OS === "ios") {
    // to render over screens:
    return (
      <BottomSheetCtx.Provider value={context}>
        <FullWindowOverlay>
          {fadeOverlay}
          {touchOverlay}
          {sheetContent}
        </FullWindowOverlay>
        {children}
      </BottomSheetCtx.Provider>
    );
  }

  return (
    <BottomSheetCtx.Provider value={context}>
      <View style={{ flex: 1 }}>
        {children}
        {fadeOverlay}
        {touchOverlay}
        {sheetContent}
      </View>
    </BottomSheetCtx.Provider>
  );
}

export function useBottomSheet<Options>(
  renderNode: (opts: { onClose: () => void; options: Options }) => ReactNode,
) {
  const context = useContext(BottomSheetCtx);
  if (!context)
    throw new Error(
      "Cannot useBottomSheet outside of BottomSheetProvider (context).",
    );

  return (options: Options) => {
    context.open(options, renderNode);
  };
}
