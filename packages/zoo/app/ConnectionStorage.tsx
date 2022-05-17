import { defineKeySource } from "@zerve/core";
import { createNativeStorage } from "@zerve/native";
import {
  Connection,
  postZAction,
  SavedConnection,
  SavedConnectionProvider,
  SavedSession,
} from "@zerve/query";

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

function clearSessionToken(connectionKey: string) {
  mutateConnections((connections) =>
    connections.map((conn) => {
      if (conn.key !== connectionKey) return conn;
      if (!conn.session) return conn;
      return {
        ...conn,
        session: {
          ...conn.session,
          sessionToken: null,
        },
      };
    })
  );
}

function clearSession(connectionKey: string) {
  setSession(connectionKey, null);
}

export async function logout(connection: Connection, session: SavedSession) {
  clearSessionToken(connection.key);
  await postZAction(connection, [...session.authPath, "logout"], {
    userId: session.userId,
    sessionId: session.sessionId,
  });
  clearSession(connection.key);
}

export async function forceLocalLogout(connection: Connection) {
  clearSession(connection.key);
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

export function ConnectionKeyProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: null | string;
}) {
  const savedConnection = useSavedConnection(value);
  return (
    <SavedConnectionProvider value={savedConnection}>
      {children}
    </SavedConnectionProvider>
  );
}
