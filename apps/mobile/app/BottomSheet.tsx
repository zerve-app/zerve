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
import BottomSheet from "@gorhom/bottom-sheet";
import { defineKeySource } from "@zerve/core";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@zerve/ui";
import { AbsoluteFill } from "@zerve/ui/Style";

type BottomSheetContext = {
  open: (
    node: (opts: { onClose: () => void }) => ReactNode,
    snapPoints: string[] | undefined
  ) => void;
  close: () => void;
};

export const BottomSheetCtx = createContext<null | BottomSheetContext>(null);

type SheetConfig = {
  key: string;
  snapPoints: string[] | undefined;
  children: ReactNode;
};

const getBottomSheetKey = defineKeySource("BottomSheet");

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [sheetConfig, setSheetConfig] = useState<null | SheetConfig>();

  const colors = useColors();
  const layerVisibility = useSharedValue(0);
  const layerStyles = useAnimatedStyle(() => ({
    ...AbsoluteFill,
    opacity: layerVisibility.value * 0.3,
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
        renderNode: (opts: { onClose: () => void }) => ReactNode,
        snapPoints: string[] | undefined
      ) => {
        setSheetConfig({
          snapPoints,
          children: renderNode({ onClose: close }),
          key: getBottomSheetKey(),
        });
      },
      close,
    }),
    [setSheetConfig, close]
  );
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
            key={sheetConfig.key}
            enablePanDownToClose
            ref={bottomSheetRef}
            index={0}
            snapPoints={sheetConfig.snapPoints || ["100%"]}
            onChange={handleSheetChanges}
          >
            {sheetConfig.children}
          </BottomSheet>
        )}
      </View>
    </BottomSheetCtx.Provider>
  );
}

export function useBottomSheet(
  renderNode: (opts: { onClose: () => void }) => ReactNode,
  snapPoints: undefined | string[]
) {
  const context = useContext(BottomSheetCtx);
  if (!context)
    throw new Error(
      "Cannot useBottomSheet outside of BottomSheetProvider (context)."
    );

  return () => {
    context.open(renderNode, snapPoints);
  };
}
