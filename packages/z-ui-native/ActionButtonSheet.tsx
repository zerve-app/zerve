import React from "react";
import { ActionButton, ActionButtonDef, VStack } from "@zerve/ui";
import { useBottomSheet } from "./BottomSheet";

export function useActionsSheet(getActions: () => ActionButtonDef[]) {
  return useBottomSheet<void>(({ onClose }) => (
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
}
