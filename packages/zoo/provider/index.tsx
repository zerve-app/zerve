import { ZenProvider } from "@zerve/zen/Provider";
import { NavigationProvider } from "./navigation";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <ZenProvider>{children}</ZenProvider>
    </NavigationProvider>
  );
}
