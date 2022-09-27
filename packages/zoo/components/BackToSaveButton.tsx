import { Button } from "@zerve/zen/Button";

export function BackToSaveButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      onPress={onPress}
      chromeless
      title="Unsaved Changes. Back to Save"
    />
  );
}
