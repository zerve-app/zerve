import { useConnection } from "@zerve/client/Connection";
import { useZObservableMaybe } from "@zerve/react";

export function useConnectionStatus() {
  const connection = useConnection();
  const isConnected = useZObservableMaybe(connection?.isConnected);
  return {
    isConnected,
  };
}
