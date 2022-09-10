import { Button, HStack } from "@zerve/zen";

export function SaveOrDiscardFooter({
  onSave,
  onDiscard,
}: {
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <HStack padded>
      <Button chromeless danger title="Discard" onPress={onDiscard} />
      <Button primary title="Save Changes" onPress={onSave} />
    </HStack>
  );
}
