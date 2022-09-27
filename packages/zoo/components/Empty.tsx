import { VSpaced } from "@zerve/zen/Stack";
import { Title } from "@zerve/zen/Text";

export function EmptyContentRow({ message }: { message: string }) {
  return (
    <VSpaced space={4}>
      <Title secondary style={{ textAlign: "center" }} title={message} />
    </VSpaced>
  );
}
