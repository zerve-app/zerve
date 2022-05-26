import * as Dialog from "@radix-ui/react-dialog";
import { A, View } from "dripsy";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { AbsoluteFill, bigShadow, smallShadow } from "./Style";

type ModalContext = null | {
  onModal: (
    renderer: (opts: { onClose: () => void }) => React.ReactNode
  ) => void;
};
const ModalContext = createContext<ModalContext>(null);

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode
) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Cannot useModal outside of Zen or Modal context");
  const onOpen = (options: Options) => {
    ctx.onModal(({ onClose }) => renderModal({ options, onClose }));
  };
  return onOpen;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openDialogContent, setOpenDialogContent] = useState<null | ReactNode>(
    null
  );
  const onClose = () => {
    setOpenDialogContent(null);
  };
  const context = useMemo(
    () => ({
      onModal: (
        renderer: (opts: { onClose: () => void }) => React.ReactNode
      ) => {
        setOpenDialogContent(renderer({ onClose }));
      },
    }),
    []
  );
  return (
    <ModalContext.Provider value={context}>
      <Dialog.Root
        open={!!openDialogContent}
        onOpenChange={(v) => {
          setOpenDialogContent(null);
        }}
      >
        {children}
        <Dialog.Overlay>
          <View
            sx={{
              ...AbsoluteFill,
              backgroundColor: "#ccc5",
            }}
          />
        </Dialog.Overlay>
        <Dialog.DialogContent>
          <View
            pointerEvents="box-none"
            sx={{
              ...AbsoluteFill,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              sx={{
                padding: 30,
                backgroundColor: "white",
                borderRadius: 10,
                ...bigShadow,
              }}
            >
              {openDialogContent}
            </View>
          </View>
        </Dialog.DialogContent>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}
