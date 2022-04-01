import React from "react";

import { Icon, IconButton } from "@zerve/ui";

export function OptionsButton({ onOptions }: { onOptions: () => void }) {
  return (
    <IconButton
      icon={(props) => <Icon {...props} name="ellipsis-h" />}
      altTitle="Options"
      onPress={onOptions}
    />
  );
}
