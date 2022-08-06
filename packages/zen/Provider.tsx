import { ReactNode } from "react";
import { ModalProvider } from "./Modal";

export function ZenProvider({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}
