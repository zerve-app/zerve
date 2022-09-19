import { VStack } from "@zerve/zen";
import { Notice } from "@zerve/zen/Notice";

export function ErrorRow({ message }: { message: string }) {
  return (
    <VStack padded>
      <Notice danger icon="exclamation-circle" message={message} />
    </VStack>
  );
}
