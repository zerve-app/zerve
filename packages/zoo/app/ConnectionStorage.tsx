import { defineKeySource } from "@zerve/core";
import { createStorage } from "@zerve/client-storage/Storage";
import { postZAction } from "@zerve/client/ServerCalls";
import {
  Connection,
  SavedConnection,
  SavedConnectionProvider,
  SavedSession,
} from "@zerve/client/Connection";
import { Platform } from "react-native";
import { SiteConfig } from "./SiteConfig";
import { useEffect, useMemo } from "react";

const connectionStorage = createStorage({
  id: "ConnectionStorage",
});

const NativeDefaultConnections: SavedConnection[] = [
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

// on web we don't need to store any connections by default, because it connects to its own host. in contrast to the mobile app
const DefaultConnections =
  Platform.OS === "web" ? [] : NativeDefaultConnections;

const connectionsNode = connectionStorage.getStorageNode(
  "Connections",
  DefaultConnections
);

export function useConnectionDisclosedState(connectionKey: string) {
  const node = connectionStorage.getStorageNode(
    `disclosed-${connectionKey}`,
    true
  );
  return connectionStorage.useNodeState(node);
}

export function setConnectionDisclosed(
  connectionKey: string,
  isDisclosed: boolean
) {
  const node = connectionStorage.getStorageNode(
    `disclosed-${connectionKey}`,
    true
  );
  node.set(isDisclosed);
}

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

export const WEB_PRIMARY_CONN = __DEV__ ? "dev" : "main";

export function useWebConnection(config: SiteConfig) {
  const savedConn = useSavedConnection(WEB_PRIMARY_CONN);
  const conn = useMemo(() => {
    return (
      savedConn || {
        key: WEB_PRIMARY_CONN,
        name: config?.name ? config.name : "Main",
        url: config.origin,
        session: null,
      }
    );
  }, [savedConn]);
  useEffect(() => {
    if (config.origin !== savedConn?.url)
      resetConnection(WEB_PRIMARY_CONN, config.origin);
  }, [config, savedConn]);

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

export function resetConnection(key: string, url: string) {
  mutateConnections((connections) => {
    if (connections.findIndex((conn) => conn.key === key) !== -1) {
      return connections.map((conn) => {
        if (conn.key === key)
          return { key, name: conn.name, url, session: null };
        return conn;
      });
    } else {
      return [...connections, { key, name: key, url, session: null }];
    }
  });
}

export function reorderConnection(fromIndex: number, toIndex: number) {
  mutateConnections((connections) => {
    const reordered = [...connections];
    const [item] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, item);
    return reordered;
  });
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

export function setSessionUserId(connectionKey: string, userId: string) {
  mutateConnections((connections) =>
    connections.map((conn) => {
      if (conn.key !== connectionKey) return conn;
      if (!conn.session) return conn;
      return {
        ...conn,
        session: {
          ...conn.session,
          userId,
          userLabel: userId,
        },
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
