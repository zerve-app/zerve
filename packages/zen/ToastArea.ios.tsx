import { FullWindowOverlay } from "react-native-screens";
import { ToastPresenter } from "./Toast";

export function ToastArea() {
  return (
    <FullWindowOverlay>
      <ToastPresenter />
    </FullWindowOverlay>
  );
}
