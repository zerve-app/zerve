import * as DialogPrimitive from "@radix-ui/react-dialog";

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode
) {
  return (options: Options) => {};
}
