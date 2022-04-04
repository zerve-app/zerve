import { defineKeySource } from "@zerve/core";
import { createNativeStorage } from "@zerve/native";

const connectionStorage = createNativeStorage({
  id: "ConnectionStorage",
});

export type ConnectionDefinition = {
  key: string;
  name: string;
  url: string;
};

const DefaultConnections: ConnectionDefinition[] = [
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

export function useConnectionsMeta() {
  return connectionStorage.useNodeState(connectionsNode);
}

export function getConnection(connectionKey: string) {
  return connectionsNode.get().find((conn) => conn.key === connectionKey);
}

export function useConnection(connectionKey: string | null) {
  if (connectionKey === null) return null;
  const connections = useConnectionsMeta();
  const conn = connections.find((c) => c.key === connectionKey) || null;
  return conn;
}

export function mutateConnections(
  mutator: (connections: ConnectionDefinition[]) => ConnectionDefinition[]
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
