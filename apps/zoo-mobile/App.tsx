import React from "react";
import { Provider } from "@zerve/zoo/provider";
import { RootNavigator } from "@zerve/zoo/app/NativeNavigation";
import { ToastPresenter } from "@zerve/zen";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ToastArea() {
  const { top } = useSafeAreaInsets();
  return (
    <FullWindowOverlay
      style={{
        position: "absolute",
        height: 100,
        left: 0,
        right: 0,
        top,
      }}
    >
      <ToastPresenter />
    </FullWindowOverlay>
  );
}
export default function App() {
  return (
    <Provider>
      {/* <ToastArea /> */}
      <RootNavigator />
    </Provider>
  );
}
