import { useBottomSheet } from "./BottomSheet";

export function useModal<Options>(
  renderModal: (opts: {
    onClose: () => void;
    options: Options;
  }) => React.ReactNode
) {
  return useBottomSheet<Options>(renderModal);
}
