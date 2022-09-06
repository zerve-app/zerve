import { ZenProvider } from "@zerve/zen/Provider";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { ReactNode } from "react";
import { useWebConnection } from "../app/ConnectionStorage";
import { SiteConfig } from "../app/SiteConfig";

export function WebPageProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: SiteConfig;
}) {
  const conn = useWebConnection(config);
  return (
    <ConnectionProvider value={conn}>
      <ZenProvider>{children}</ZenProvider>
    </ConnectionProvider>
  );
}
