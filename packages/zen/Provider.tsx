import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetProvider } from "./BottomSheet";
import { ModalProvider } from "./Modal";

export function ZenProvider({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetProvider>
          <ModalProvider>{children}</ModalProvider>
        </BottomSheetProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
