import { ReactNode } from "react";
import { ActionButton, ActionButtonDef } from "./ActionButton";
import { VStack } from "./Stack";
import { useBottomSheet } from "./BottomSheet";
import { Pressable } from "react-native";

export function useActionsSheet(
  renderButton: (onOpen: () => void) => ReactNode,
  actions: ActionButtonDef[],
): readonly [null | ReactNode, () => void] {
  const onOpen = useBottomSheet<ActionButtonDef[]>(({ onClose, options }) => (
    <VStack padded>
      {options.map((action) => (
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
  if (actions.length) {
    return [
      <Pressable
        onPress={() => {
          onOpen(actions);
        }}
      >
        {renderButton(() => onOpen(actions))}
      </Pressable>,
      () => onOpen(actions),
    ] as const;
  } else {
    return [renderButton(() => {}), () => {}] as const;
  }
}
