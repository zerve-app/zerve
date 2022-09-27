import { Notice } from "@zerve/zen/Notice";
import { VStack } from "@zerve/zen/Stack";

export function ErrorRow({ message }: { message: string }) {
  return (
    <VStack padded>
      <Notice danger icon="exclamation-circle" message={message} />
    </VStack>
  );
}
