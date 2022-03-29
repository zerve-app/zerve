import React from "react";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { useBottomSheet, VStack } from ".";

export type ActionButtonDef = {
  key: string;
  title: string;
  icon?: any;
  danger?: boolean;
  primary?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onHandled?: () => void;
};

export function ActionButton({ action }: { action: ActionButtonDef }) {
  const { icon, onLongPress } = action;
  return (
    <Button
      title={action.title}
      danger={action.danger}
      primary={action.primary}
      onPress={() => {
        action.onPress();
        action.onHandled?.();
      }}
      onLongPress={
        onLongPress
          ? () => {
              onLongPress();
              action.onHandled?.();
            }
          : undefined
      }
      right={(p) => (icon ? <Icon {...p} name={icon} /> : null)}
    />
  );
}

export function useActionsSheet(actions: ActionButtonDef[]) {
  return useBottomSheet<void>(({ onClose }) => (
    <VStack>
      {actions.map((action) => (
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
