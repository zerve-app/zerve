import { defineKeySource } from "@zerve/core";
import {
  getStorageNode,
  mutateStorage,
  useNodeState,
  useStorage,
  useStored,
} from "@zerve/native";
import { useCallback } from "react";

export type Connection = {
  key: string;
  name: string;
  url: string;
};

const DefaultConnections: Connection[] = [
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

const connectionsNode = getStorageNode("Connections", DefaultConnections);

export function useConnections() {
  return useNodeState(connectionsNode);
}

export function getConnection(connectionKey: string) {
  return connectionsNode.get().find((conn) => conn.key === connectionKey);
}

export function useConnection(connectionKey: string) {
  const connections = useConnections();
  return connections.find((c) => c.key === connectionKey);
}

export function mutateConnections(
  mutator: (connections: Connection[]) => Connection[]
) {
  mutateStorage("Connections", DefaultConnections, mutator);
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
