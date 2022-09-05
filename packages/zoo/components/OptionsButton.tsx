import React from "react";

import { Icon, IconButton } from "@zerve/zen";

export function OptionsButton({ onOptions }: { onOptions: () => void }) {
  return (
    <IconButton
      icon={(props) => <Icon {...props} name="ellipsis-v" />}
      altTitle="Options"
      onPress={onOptions}
    />
  );
}
