import React, { ReactNode } from "react";
import { ActionButton, ActionButtonDef } from "./ActionButton";
import { VStack } from "./Stack";
import { useBottomSheet } from "./BottomSheet";

export function useActionsSheet(
  renderButton: (onOpen: () => void) => ReactNode,
  getActions: () => ActionButtonDef[]
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
  return [renderButton(onOpen), onOpen] as const;
}
