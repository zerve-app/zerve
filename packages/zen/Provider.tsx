import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetProvider } from "./BottomSheet";
import { ModalProvider } from "./Modal";

export function ZenProvider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetProvider>
        <ModalProvider>{children}</ModalProvider>
      </BottomSheetProvider>
    </GestureHandlerRootView>
  );
}
