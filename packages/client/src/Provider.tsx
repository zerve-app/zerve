import React, { ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "react-query";

const queryClient = new QueryClient();

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
