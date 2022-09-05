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
import { BackHandler, View } from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "./useColors";
import { AbsoluteFill, bigShadow, smallShadow } from "./Style";

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
    backgroundColor: colors.background,
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
  return (
    <BottomSheetCtx.Provider value={context}>
      <View style={{ flex: 1 }}>
        {children}
        <Animated.View style={layerStyles} pointerEvents="none" />
        {isOpen ? (
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
        ) : null}
        {sheetConfig && (
          <BottomSheet
            style={[bigShadow, { elevation: 12 }]}
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
            <View
              onLayout={handleContentLayout}
              style={{
                backgroundColor: colors.backgroundDim,
                ...smallShadow,
              }}
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
