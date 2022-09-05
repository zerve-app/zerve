import { ReactNode } from "react";
import { Platform } from "react-native";

import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaFrameContext,
} from "react-native-safe-area-context";

import { StatusBar } from "react-native";

function InternalReproviderShameful({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;
  return (
    <SafeAreaInsetsContext.Provider
      value={{
        ...insets,
        top: topInset,
      }}
    >
      <SafeAreaFrameContext.Provider
        value={{
          ...frame,
        }}
      >
        {children}
      </SafeAreaFrameContext.Provider>
    </SafeAreaInsetsContext.Provider>
  );
}

export function SafeAreaContextProvider({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <InternalReproviderShameful>{children}</InternalReproviderShameful>
    </SafeAreaProvider>
  );
}
