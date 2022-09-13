import React, { ReactNode } from "react";
import { ActionButton, ActionButtonDef } from "./ActionButton";
import { VStack } from "./Stack";
import { useBottomSheet } from "./BottomSheet";
import { Pressable } from "react-native";

export function useActionsSheet(
  renderButton: (onOpen: () => void) => ReactNode,
  getActions: () => ActionButtonDef[],
): readonly [null | ReactNode, () => void] {
  const onOpen = useBottomSheet<void>(({ onClose }) => (
    <VStack padded>
      {getActions().map((action) => (
        <ActionButton
          key={action.key}
          action={{
            ...action,
            onHandled: () => {
              onClose();
              action.onHandled?.();
            },
          }}
        />
      ))}
    </VStack>
  ));
  return [
    <Pressable onPress={() => onOpen()}>{renderButton(onOpen)}</Pressable>,
    onOpen,
  ] as const;
}
