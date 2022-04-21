import { defineKeySource } from "@zerve/core";
import { createNativeStorage } from "@zerve/native";
import { SavedConnection, SavedSession, useLiveConnection } from "@zerve/query";
import { useZObservableMaybe } from "@zerve/react";

const connectionStorage = createNativeStorage({
  id: "ConnectionStorage",
});

const DefaultConnections: SavedConnection[] = [
  ...(__DEV__
    ? [
        {
          key: "dev",
          name: "[TEST] Local Dev Server",
          url: "http://localhost:3888",
        },
      ]
    : []),
  {
    key: "main",
    name: "Zerve Public Server",
    url: "https://zerve.app",
  },
];

const connectionsNode = connectionStorage.getStorageNode(
  "Connections",
  DefaultConnections
);

export function useSavedConnections() {
  return connectionStorage.useNodeState(connectionsNode);
}

export function getConnection(connectionKey: string) {
  return connectionsNode.get().find((conn) => conn.key === connectionKey);
}

export function useSavedConnection(connectionKey: string | null) {
  if (connectionKey === null) return null;
  const connections = useSavedConnections();
  const conn = connections.find((c) => c.key === connectionKey) || null;
  return conn;
}

export function mutateConnections(
  mutator: (connections: SavedConnection[]) => SavedConnection[]
) {
  connectionStorage.mutateStorage("Connections", DefaultConnections, mutator);
}

export function destroyConnection(key: string) {
  mutateConnections((connections) =>
    connections.filter((conn) => conn.key !== key)
  );
}

const getConnectionKey = defineKeySource("Connection");

export function createConnection(name: string, url: string) {
  const key = getConnectionKey();
  mutateConnections((connections) => [...connections, { name, url, key }]);
}

export function setSession(
  connectionKey: string,
  session: SavedSession | null
) {
  mutateConnections((connections) =>
    connections.map((conn) => {
      if (conn.key !== connectionKey) return conn;
      return {
        ...conn,
        session,
      };
    })
  );
}

export function useConnectionStatus() {
  const savedConn = useSavedConnection();
  const connection = useLiveConnection(savedConn);
  const isConnected = useZObservableMaybe(connection?.isConnected);
  return {
    isConnected,
  };
}
