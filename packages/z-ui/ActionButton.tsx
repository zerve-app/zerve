import React from "react";
import { Icon } from "./Icon";
import { Button } from "./Button";

export type ActionButtonDef = {
  key: string;
  title: string;
  icon?: any;
  onPress: () => void;
  onLongPress?: () => void;
};

export function ActionButton({ action }: { action: ActionButtonDef }) {
  const { icon } = action;
  return (
    <Button
      title={action.title}
      onPress={action.onPress}
      onLongPress={action.onLongPress}
      right={(p) => (icon ? <Icon {...p} name={icon} /> : null)}
    />
  );
}
