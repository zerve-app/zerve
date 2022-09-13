import * as Dialog from "@radix-ui/react-dialog";
import { View, ViewStyle } from "react-native";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { AbsoluteFill, bigShadow, smallShadow } from "./Style";
import { AnimatePresence, MotiView } from "moti";
import { BlurView } from "expo-blur";
import { Easing } from "react-native-reanimated";

type ModalContext = null | {
  onModal: (
    renderer: (opts: { onClose: () => void }) => React.ReactNode,
  ) => void;
};
const ModalContext = createContext<ModalContext>(null);

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode,
) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Cannot useModal outside of Zen or Modal context");
  const onOpen = (options: Options) => {
    ctx.onModal(({ onClose }) => renderModal({ options, onClose }));
  };
  return onOpen;
}

function WebBlurView({
  style,
  children,
}: {
  style: ViewStyle;
  children: ReactNode;
}) {
  if ("GestureEvent" in global.window) {
    // safari doesnt support BlurView in my testing
    return (
      <View style={[{ backgroundColor: "white" }, style]}>{children}</View>
    );
  }
  return <BlurView style={style}>{children}</BlurView>;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModalContent, setOpenModalContent] = useState<null | ReactNode>(
    null,
  );
  const onClose = () => {
    setOpenModalContent(null);
  };
  const context = useMemo(
    () => ({
      onModal: (
        renderer: (opts: { onClose: () => void }) => React.ReactNode,
      ) => {
        setOpenModalContent(renderer({ onClose }));
      },
    }),
    [],
  );
  return (
    <ModalContext.Provider value={context}>
      <Dialog.Root
        open={!!openModalContent}
        onOpenChange={(v) => {
          setOpenModalContent(null);
        }}
      >
        {children}
        <AnimatePresence>
          {openModalContent && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "timing",
                duration: 800,
              }}
              style={{
                ...AbsoluteFill,
                backgroundColor: "#fff9",
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {openModalContent && (
            <Dialog.DialogContent forceMount>
              <MotiView
                from={{ translateY: 800, rotateX: "90deg" }}
                animate={{ translateY: 0, rotateX: "0deg" }}
                exit={{ translateY: 800, rotateX: "90deg" }}
                transition={{
                  easing: Easing.inOut(Easing.poly(5)),
                  type: "timing",
                  duration: 500,
                }}
                exitTransition={{
                  easing: Easing.inOut(Easing.poly(5)),
                  type: "timing",
                  duration: 300,
                }}
                pointerEvents="box-none"
                style={{
                  ...AbsoluteFill,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <WebBlurView
                  style={{
                    padding: 30,
                    borderRadius: 10,
                    ...bigShadow,
                  }}
                >
                  {openModalContent}
                </WebBlurView>
              </MotiView>
            </Dialog.DialogContent>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}
