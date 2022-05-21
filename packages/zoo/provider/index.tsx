import { ClientProvider } from "@zerve/client/Provider";
import { Dripsy } from "./dripsy";
import { NavigationProvider } from "./navigation";
import { SafeArea } from "./SafeArea";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <SafeArea>
        <NavigationProvider>
          <Dripsy>{children}</Dripsy>
        </NavigationProvider>
      </SafeArea>
    </ClientProvider>
  );
}
