import { defineKeySource } from "@zerve/zed";
import { useAllColors } from "./useColors";
import { AbsoluteFill, bigShadow } from "@zerve/zen/Style";
import { useEffect, useState } from "react";
import { Platform, Text } from "react-native";
import { Pressable } from "react-native";
import { View } from "react-native";
import { MotiView } from "moti";
import { AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Toast = {
  message: string;
  type: "notice" | "error";
  key: string;
  durationSec?: number;
};

let toasts: Toast[] = [];
const toastHandlers = new Set<(toasts: Toast[]) => void>();

function appendToast(t: Toast) {
  const key = t.key;
  toasts = [...toasts, t];
  toastHandlers.forEach((handler) => handler(toasts));
  setTimeout(
    () => {
      clearToast(key);
    },
    t.durationSec ? t.durationSec * 1000 : 6000,
  );
}

function clearToast(toastKey: string) {
  toasts = toasts.filter((t) => t.key !== toastKey);
  toastHandlers.forEach((handler) => handler(toasts));
}

const getToastKey = defineKeySource("Toast");

export function showToast(message: string) {
  appendToast({ message, type: "notice", key: getToastKey() });
}

export function showErrorToast(message: string) {
  appendToast({ message, type: "error", key: getToastKey() });
}

function ToastRow({ toast }: { toast: Toast }) {
  const colors = useAllColors();
  return (
    <MotiView
      from={
        Platform.OS === "web"
          ? {
              // why this, you ask? well, the toast opening animation doesn't appear to work on web...
              scale: 1,
              opacity: 1,
              height: 50,
              // don't ask me why, presumably this is an issue with Moti
            }
          : {
              scale: 1,
              opacity: 0,
              height: 0,
            }
      }
      animate={{
        scale: 1,
        opacity: 1,
        height: 50,
      }}
      exit={{
        scale: 3,
        opacity: -3,
        height: 0,
      }}
      transition={{
        type: "timing",
      }}
      pointerEvents="box-none"
      style={{
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <Pressable
        onPress={() => {
          clearToast(toast.key);
        }}
      >
        <View
          style={{
            ...bigShadow,
            marginBottom: 10,
            backgroundColor: colors.inverted.backgroundDim,
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 25,
          }}
        >
          <Text
            style={{
              color:
                toast.type === "error"
                  ? colors.inverted.dangerText
                  : colors.inverted.text,
            }}
          >
            {toast.message}
          </Text>
        </View>
      </Pressable>
    </MotiView>
  );
}

export function ToastPresenter() {
  const [internalToasts, setInternalToasts] = useState(toasts);
  useEffect(() => {
    function updateToasts(t: Toast[]) {
      setInternalToasts(t);
    }
    toastHandlers.add(updateToasts);
    return () => {
      toastHandlers.delete(updateToasts);
    };
  }, []);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        ...AbsoluteFill,
        ...insets,
        paddingTop: Platform.select({
          ios: 0,
          web: 10,
          android: 5,
          default: 5,
        }),
      }}
      pointerEvents="box-none"
    >
      <AnimatePresence>
        {internalToasts.map((t) => (
          <ToastRow toast={t} key={t.key} />
        ))}
      </AnimatePresence>
    </View>
  );
}
