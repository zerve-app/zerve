import React, { ReactElement, ReactNode, useState } from "react";
import { Pressable, Text } from "react-native";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { ActionButtonDef } from "./ActionButton";
import { smallShadow } from "./Style";
import { useAllColors, useColors } from "./useColors";

function ActionMenuItemUnmemo({ action }: { action: ActionButtonDef }) {
  const colors = useAllColors();
  const [isFocused, setIsFocused] = React.useState(false);
  const handlePress = () => {
    action.onPress();
    action.onHandled?.();
  };
  const handleLongPress = () => {
    action.onLongPress?.();
    action.onHandled?.();
  };
  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
      <DropdownMenu.Item
        onSelect={handlePress}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        style={{
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 10,
          paddingRight: 10,
          cursor: "pointer",
          backgroundColor: isFocused ? colors.active.tint : "transparent",
        }}
      >
        <Text
          style={{
            color: isFocused ? colors.inverted.text : colors.active.text,
          }}
        >
          {action.title}
        </Text>
      </DropdownMenu.Item>
    </Pressable>
  );
}
const ActionMenuItem = React.memo(ActionMenuItemUnmemo);

export function useActionsSheet(
  renderButton: (onOpen: () => void) => ReactElement,
  getActions: () => ActionButtonDef[],
): readonly [null | ReactElement, () => void] {
  const [isOpen, setIsOpen] = useState(false);
  function onOpen() {
    setIsOpen(true);
  }
  const colors = useColors();
  return [
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger
        style={{ border: "none", backgroundColor: "transparent" }}
      >
        {renderButton(onOpen)}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={{
          minWidth: 130,
          borderRadius: 2,
          backgroundColor: colors.background,
          ...smallShadow,
          boxShadow: "0 2px 5px #00000040",
          paddingTop: 8,
          paddingBottom: 8,
          zIndex: 10000000,
        }}
      >
        {getActions().map((action) => (
          <ActionMenuItem action={action} key={action.key} />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>,

    () => {},
  ] as const;
}
