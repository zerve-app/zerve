import { ZenProvider } from "@zerve/zen/Provider";
import { ReactNode } from "react";

export function PageProvider({ children }: { children: ReactNode }) {
  return <ZenProvider>{children}</ZenProvider>;
}
