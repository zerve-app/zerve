import { AnimatePresence, MotiView } from "moti";
import React, { createContext, useContext, useMemo, useState } from "react";
import { ReactNode } from "react";
import { BlurView } from "expo-blur";
import { AbsoluteFill, bigShadow } from "./Style";
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useColorScheme } from "./useColorScheme";
import { useColors } from "./useColors";
import { FullWindowOverlay } from "react-native-screens";

// danger, this stuff is .native only o_O
type ModalCtx = {
  openModal: (
    renderModal: (props: { onClose: () => void }) => ReactNode,
  ) => void;
};

const ModalNativeContext = createContext<ModalCtx | null>(null);

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode,
) {
  const ctx = useContext(ModalNativeContext);
  if (!ctx) throw new Error("Must useModal within a ModalProvider");
  return (options: Options) => {
    ctx.openModal(({ onClose }) => renderModal({ options, onClose }));
  };
}

function generateKey() {
  const length = 6;
  return (Math.random().toString(36) + "00000000000000000").slice(
    2,
    length + 2,
  );
}

type ModalState = { content: ReactNode; key: string };

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<ModalState[]>([]);
  const { height: keyboardHeight } = useAnimatedKeyboard();
  const modalFrameStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));
  const colorScheme = useColorScheme();
  const colors = useColors();
  let modalPresenter = (
    <>
      <AnimatePresence>
        {openModals.length ? (
          <MotiView
            style={{
              ...AbsoluteFill,
              backgroundColor:
                colorScheme === "light"
                  ? `${colors.background}88`
                  : `${colors.backgroundDim}aa`,
            }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Pressable
              style={{
                ...AbsoluteFill,
              }}
              onPress={() => {
                Keyboard.dismiss();
                setOpenModals((modals) => modals.slice(0, -1));
              }}
            >
              <View style={AbsoluteFill} />
            </Pressable>
          </MotiView>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {openModals.map((openModal, index) => (
          <MotiView
            key={openModal.key}
            style={{ ...AbsoluteFill, justifyContent: "center" }}
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 100 }}
            transition={{
              type: "timing",
              easing: Easing.elastic(),
              duration: 250,
            }}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[
                modalFrameStyle,
                {
                  ...bigShadow,
                  marginHorizontal: 12,
                  marginVertical: 36,
                },
              ]}
              pointerEvents="box-none"
            >
              <View
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <BlurView tint={colorScheme} style={{}}>
                  {openModal.content}
                </BlurView>
              </View>
            </Animated.View>
          </MotiView>
        ))}
      </AnimatePresence>
    </>
  );
  if (Platform.OS === "ios") {
    modalPresenter = <FullWindowOverlay>{modalPresenter}</FullWindowOverlay>;
  }
  return (
    <ModalNativeContext.Provider
      value={useMemo(
        () => ({
          openModal: (
            renderModal: (props: { onClose: () => void }) => ReactNode,
          ) => {
            const modalState = {
              content: renderModal({
                onClose: () => {
                  Keyboard.dismiss();
                  setOpenModals((modals) =>
                    modals.filter((m) => m !== modalState),
                  );
                },
              }),
              key: generateKey(),
            } as const;
            setOpenModals((modals) => [...modals, modalState] as ModalState[]);
          },
        }),
        [],
      )}
    >
      {children}
      {modalPresenter}
    </ModalNativeContext.Provider>
  );
}
