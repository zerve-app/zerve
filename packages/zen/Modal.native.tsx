import React from "react";
import { ReactNode } from "react";
import { BottomSheetProvider, useBottomSheet } from "./BottomSheet";

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode,
) {
  return useBottomSheet<Options>(renderModal);
}

export function ModalProvider({ children }: { children: ReactNode }) {
  return <BottomSheetProvider>{children}</BottomSheetProvider>;
}
