import React, { ReactElement, ReactNode, useState } from "react";
import { Pressable, Text } from "react-native";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { ActionButtonDef } from "./ActionButton";
import { smallShadow } from "./Style";
import { useAllColors, useColors } from "./useColors";
import { Icon } from "./Icon";

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
  const color = action.danger ? colors.active.dangerText : colors.active.text;
  const activeBackground = action.danger
    ? colors.active.dangerText
    : colors.active.tint;
  const textColor = isFocused ? colors.inverted.text : color;
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
          backgroundColor: isFocused ? activeBackground : "transparent",
          alignItems: "center",
          display: "flex",
        }}
      >
        {action.icon && <Icon name={action.icon} color={textColor} size={16} />}
        <Text
          style={{
            color: textColor,
            marginLeft: action.icon ? 10 : 0,
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
  disabled?: boolean,
): readonly [null | ReactElement, () => void] {
  const [isOpen, setIsOpen] = useState(false);
  function onOpen() {
    if (disabled) return;
    setIsOpen(true);
  }
  const colors = useColors();
  const content = disabled ? (
    renderButton(onOpen)
  ) : (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger
        style={{
          border: "none",
          backgroundColor: "transparent",
          padding: 0,
        }}
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
    </DropdownMenu.Root>
  );
  return [
    content,
    () => {
      setIsOpen(true);
    },
  ] as const;
}
