import { QueryProvider } from "@zerve/query";
import { Dripsy } from "./dripsy";
import { NavigationProvider } from "./navigation";
import { SafeArea } from "./SafeArea";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SafeArea>
        <NavigationProvider>
          <Dripsy>{children}</Dripsy>
        </NavigationProvider>
      </SafeArea>
    </QueryProvider>
  );
}
