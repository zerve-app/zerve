import { IconButton } from "@zerve/zen/Button";
import { Icon } from "@zerve/zen/Icon";

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
        <Icon {...props} name={cancelButton ? "close" : "chevron-left"} />
      )}
      altTitle="close"
      onPress={onPress}
    />
  );
}
