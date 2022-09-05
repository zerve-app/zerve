import { FullWindowOverlay } from "react-native-screens";
import { ToastPresenter } from "./Toast";

export function ToastArea() {
  return (
    <FullWindowOverlay
      style={{
        position: "absolute",
        height: 2,
        left: 0,
        right: 0,
        top: 0,
      }}
    >
      <ToastPresenter />
    </FullWindowOverlay>
  );
}
