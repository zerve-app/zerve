import { Dialog } from "@zerve/zen/Dialog";
import { useModal } from "@zerve/zen/Modal";

export function useDiscardChangesDialog(discardChanges: () => void) {
  const openModal = useModal<() => void>(
    ({ onClose, options: followThroughNavigate }) => (
      <Dialog
        onClose={onClose}
        title="Discard Unsaved Changes?"
        danger
        confirmLabel="Discard Changes"
        closeLabel="Cancel"
        onConfirm={async () => {
          discardChanges();
          onClose();
          followThroughNavigate();
        }}
      />
    ),
  );
  return openModal;
}
