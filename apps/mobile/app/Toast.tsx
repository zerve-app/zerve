import { defineKeySource } from "@zerve/core";
import { ThemedText, useAllColors, useColors } from "@zerve/ui";
import { AbsoluteFill, bigShadow } from "@zerve/ui/Style";
import React, { ReactNode, useEffect, useState } from "react";
import { Text } from "react-native";
import { Pressable } from "react-native";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
    t.durationSec ? t.durationSec * 1000 : 6000
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
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(250)}
      layout={Layout.delay(250).duration(250)}
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
    </Animated.View>
  );
}

export function ToastContainer({ children }: { children: ReactNode }) {
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
  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={{ ...AbsoluteFill }} pointerEvents="box-none">
        <SafeAreaView pointerEvents="box-none">
          {internalToasts.map((t) => (
            <ToastRow toast={t} key={t.key} />
          ))}
        </SafeAreaView>
      </View>
    </View>
  );
}
