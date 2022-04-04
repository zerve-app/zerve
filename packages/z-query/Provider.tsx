import React, { ReactNode } from "react";
import { QueryClientProvider, QueryClient, notifyManager } from "react-query";

const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
