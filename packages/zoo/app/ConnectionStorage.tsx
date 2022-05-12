import {
  postZAction,
  SavedConnection,
  SavedSession,
  useConnection,
  useLiveConnection,
} from "@zerve/query";
console.log("ConnectinStorage!! ");
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

export function useSavedConnections() {}

export function getConnection(connectionKey: string) {
  throw new Error("lulz no conn on web");
}

export function useSavedConnection(connectionKey: string | null) {
  return null;
}

export function mutateConnections(
  mutator: (connections: SavedConnection[]) => SavedConnection[]
) {}

export function destroyConnection(key: string) {}

export function createConnection(name: string, url: string) {}

function clearSessionToken(connectionKey: string) {}

function clearSession(connectionKey: string) {}

export async function logout(
  connection: SavedConnection,
  session: SavedSession
) {}

export function setSession(
  connectionKey: string,
  session: SavedSession | null
) {}

export function useConnectionStatus() {
  return {
    isConnected: true,
  };
}
