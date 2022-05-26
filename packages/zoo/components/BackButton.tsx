import React, { ReactNode } from "react";

import { IconButton } from "@zerve/zen";
import { FontAwesome } from "@expo/vector-icons";

export function BackButton({
  cancelButton,
  onPress,
}: {
  cancelButton?: boolean;
  onPress: () => void;
}) {
  return (
    <IconButton
      icon={(props) => (
        <FontAwesome
          {...props}
          name={cancelButton ? "close" : "chevron-left"}
        />
      )}
      altTitle="close"
      onPress={onPress}
    />
  );
}
