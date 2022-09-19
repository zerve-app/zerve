import { Title, VSpaced } from "@zerve/zen";

export function EmptyContentRow({ message }: { message: string }) {
  return (
    <VSpaced space={4}>
      <Title secondary style={{ textAlign: "center" }} title={message} />
    </VSpaced>
  );
}
