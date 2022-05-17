import React, { ReactNode } from "react";
import { ActionButton, ActionButtonDef, VStack } from "@zerve/zen";
import { useBottomSheet } from "@zerve/zen-native";

export function useActionsSheet(
  renderButton: (onOpen: () => void) => ReactNode,
  getActions: () => ActionButtonDef[]
): readonly [null | ReactNode, () => void] {
  const onOpen = useBottomSheet<void>(({ onClose }) => (
    <VStack>
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
  return [renderButton(onOpen), onOpen] as const;
}
