import { IconButton } from "@zerve/zen/Button";
import { Icon } from "@zerve/zen/Icon";

export function OptionsButton({ onOptions }: { onOptions: () => void }) {
  return (
    <IconButton
      icon={(props) => <Icon {...props} name="ellipsis-v" />}
      altTitle="Options"
      onPress={onOptions}
    />
  );
}
