import { ClientProvider } from "@zerve/client/Provider";
import { ZenProvider } from "@zerve/zen/Provider";
import { NavigationProvider } from "./navigation";
import { SafeArea } from "./SafeArea";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <SafeArea>
        <NavigationProvider>
          <ZenProvider>{children}</ZenProvider>
        </NavigationProvider>
      </SafeArea>
    </ClientProvider>
  );
}
