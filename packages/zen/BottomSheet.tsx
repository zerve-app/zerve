import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { defineKeySource } from "@zerve/zed";

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
  const close = useCallback(() => {}, []);
  const context = useMemo(
    () => ({
      open: (
        options: any,
        renderNode: (opts: { onClose: () => void; options: any }) => ReactNode,
      ) => {},
      close,
    }),
    [close],
  );
  return (
    <BottomSheetCtx.Provider value={context}>
      {children}
    </BottomSheetCtx.Provider>
  );
}

export function useBottomSheet<Options>(
  renderNode: (opts: { onClose: () => void; options: Options }) => ReactNode,
) {
  const context = useContext(BottomSheetCtx);

  return (options: Options) => {};
}
