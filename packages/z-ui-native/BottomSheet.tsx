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
import { View } from "react-native";
import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { defineKeySource } from "@zerve/core";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AbsoluteFill, bigShadow, smallShadow, useColors } from "@zerve/ui";
import { SafeAreaView } from "react-native-safe-area-context";

export type BottomSheetContext = {
  open: <O>(
    options: O,
    node: (opts: { onClose: () => void; options: O }) => ReactNode
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
  const [sheetConfig, setSheetConfig] = useState<null | SheetConfig>();

  const colors = useColors();
  const layerVisibility = useSharedValue(0);
  const layerStyles = useAnimatedStyle(() => ({
    ...AbsoluteFill,
    opacity: layerVisibility.value * 0.5,
    backgroundColor: colors.background,
  }));
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) setSheetConfig(null);
  }, []);
  const close = useCallback(() => {
    // setSheetConfig(null);
    layerVisibility.value = withTiming(0, { duration: 25 });
    bottomSheetRef.current?.close();
  }, []);
  const context = useMemo(
    () => ({
      open: (
        options: any,
        renderNode: (opts: { onClose: () => void; options: any }) => ReactNode
      ) => {
        setSheetConfig({
          children: renderNode({ onClose: close, options }),
          key: getBottomSheetKey(),
        });
      },
      close,
    }),
    [setSheetConfig, close]
  );
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(useMemo(() => ["CONTENT_HEIGHT"], []));

  useEffect(() => {
    if (sheetConfig) {
      layerVisibility.value = withTiming(1, { duration: 25 });
    } else {
      layerVisibility.value = withTiming(0, { duration: 25 });
    }
  }, [sheetConfig]);
  return (
    <BottomSheetCtx.Provider value={context}>
      <View style={{ flex: 1 }}>
        {children}
        {sheetConfig && (
          <Pressable style={AbsoluteFill} onPress={context.close}></Pressable>
        )}
        <Animated.View style={layerStyles} pointerEvents="none" />
        {sheetConfig && (
          <BottomSheet
            style={[bigShadow, {}]}
            key={sheetConfig.key}
            enablePanDownToClose
            ref={bottomSheetRef}
            handleComponent={null}
            handleStyle={{
              backgroundColor: colors.backgroundDim,
            }}
            backgroundStyle={{
              backgroundColor: colors.backgroundDim,
            }}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            index={0}
            onChange={handleSheetChanges}
          >
            <View
              onLayout={handleContentLayout}
              style={{ backgroundColor: colors.backgroundDim }}
            >
              <SafeAreaView edges={["right", "bottom", "left"]}>
                {sheetConfig.children}
              </SafeAreaView>
            </View>
          </BottomSheet>
        )}
      </View>
    </BottomSheetCtx.Provider>
  );
}

export function useBottomSheet<Options>(
  renderNode: (opts: { onClose: () => void; options: Options }) => ReactNode
) {
  const context = useContext(BottomSheetCtx);
  if (!context)
    throw new Error(
      "Cannot useBottomSheet outside of BottomSheetProvider (context)."
    );

  return (options: Options) => {
    context.open(options, renderNode);
  };
}
