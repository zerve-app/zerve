import { QueryProvider } from "@zerve/query";
import { Dripsy } from "./dripsy";
import { NavigationProvider } from "./navigation";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NavigationProvider>
        <Dripsy>{children}</Dripsy>
      </NavigationProvider>
    </QueryProvider>
  );
}
