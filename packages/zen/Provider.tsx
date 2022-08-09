import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModalProvider } from "./Modal";

export function ZenProvider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalProvider>{children}</ModalProvider>
    </GestureHandlerRootView>
  );
}
