import { Icon, IconButton } from "@zerve/zen";

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
