import {
  createZState,
  ZBooleanSchema,
  ZObservable,
  NotFoundError,
} from "@zerve/core";
import { createContext, useContext, useEffect, useMemo } from "react";
import ReconnectingWebsocket from "reconnecting-websocket";
import { useQueryClient, QueryClient } from "react-query";
import { Buffer } from "buffer";

export type ServerMessage = {};

export type SavedConnection = {
  key: string;
  name: string;
  url: string;
  session?: SavedSession | null;
};

export type SavedSession = {
  userId: string;
  sessionId: string;
  userLabel: string;
  sessionToken: string | null; // if this token is null, the session is being destroyed!
  authPath: string[];
};

const ClientIdSchema = { type: ["null", "string"] } as const;

export type Connection = SavedConnection & {
  isConnected: ZObservable<ZBooleanSchema>;
  clientId: ZObservable<typeof ClientIdSchema>;
};

const liveConnectionStore = new Map<string, [Connection, number, () => void]>();

function startConnection(
  savedConn: SavedConnection,
  queryClient: QueryClient
): [Connection, () => void] {
  const [httpProtocol, hostPort] = savedConn.url.split("://");
  const wsProtocol = httpProtocol === "https" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${hostPort}`;
  if (!window) throw new Error("Cannot start live connection on server side.");
  const ws = new ReconnectingWebsocket(wsUrl, undefined, {
    constructor: window.WebSocket,
  });
  const clientId = createZState({ type: ["null", "string"] } as const, null);
  const isConnected = createZState({ type: "boolean" } as const, false);

  // const cache = queryClient.getQueryCache();
  // const closeCacheSubscription = cache.subscribe((event) => {
  //   if (event?.type === "queryRemoved") {
  //     // console.log("QUERY REMOVING: ", event.query.queryHash
  //   }
  // });

  ws.onopen = (conn) => {
    // really we wait to receive our clientId with the hello message before we consider ourselves connected
  };
  ws.onclose = (huh) => {
    isConnected.z.set.call(false);
    clientId.z.set.call(null);
  };
  ws.onmessage = (msg) => {
    const message = JSON.parse(msg.data);
    if (message.t === "Hello") {
      isConnected.z.set.call(true);
      clientId.z.set.call(message.id);
    } else if (message.t === "Update") {
      queryClient.setQueryData(
        [savedConn?.key, "z", ...message.path, ".node", "value"],
        message.value
      );

      queryClient.setQueryData(
        [savedConn?.key, "z", ...message.path, ".node"],
        (node) => {
          return { ...node, node: message.value };
        }
      );
    } else {
      console.log("Unrecognized Connection Message", message);
    }
  };
  function send(message: ServerMessage) {
    ws.send(JSON.stringify(message));
  }
  ws.onerror = (e) => {
    isConnected.z.set.call(false);
    clientId.z.set.call(null);
  };
  function close() {
    ws.close();
    // closeCacheSubscription();
  }
  const connection = {
    ...savedConn,
    clientId: clientId.z.state,
    isConnected: isConnected.z.state,
  };
  return [connection, close];
}

function leaseConnection(
  savedConn: SavedConnection,
  queryClient: QueryClient
): {
  connection: Connection;
  release: () => void;
} {
  const connectionKey = savedConn.key;
  const stored = liveConnectionStore.get(connectionKey);
  function release() {
    if (!stored) return;
    stored[1] -= 1;
    if (stored[1] <= 0) {
      // nobody is leasing this connection right now. close this connection:
      stored[2]();
      liveConnectionStore.delete(connectionKey);
    }
  }
  if (stored) {
    stored[1] += 1;
    let [connection] = stored;
    if (connection.session !== savedConn.session) {
      stored[0] = {
        ...connection,
        session: savedConn.session || null,
      };
      connection = stored[0];
    }
    return { connection, release };
  }
  const [connection, closeConnection] = startConnection(savedConn, queryClient);
  liveConnectionStore.set(connectionKey, [connection, 1, closeConnection]);
  return { connection, release };
}

const ConnectionContext = createContext<Connection | null>(null);

export const ConnectionProvider = ConnectionContext.Provider;

export function useConnection(): Connection | null {
  return useContext(ConnectionContext);
}

function _authHeader(auth: [string, string]) {
  return {
    Authorization: `Basic ${Buffer.from(`${auth[0]}:${auth[1]}`).toString(
      "base64"
    )}`,
  };
}

export const UnauthorizedSymbol = Symbol("Unauthorized");

export async function serverGet<Response>(
  context: SavedConnection,
  path: string,
  query?: Record<string, string> | null,
  auth?: [string, string] | null
): Promise<Response> {
  const searchParams = query && new URLSearchParams(query);
  const searchString = searchParams?.toString();
  const res = await fetch(
    `${context.url}/${path}${
      searchString && searchString.length ? `?${searchString}` : ""
    }`,
    {
      headers: {
        Accept: "application/json",
        ...(auth ? _authHeader(auth) : {}),
      },
    }
  );
  try {
    const value = await res.json();
    if (res.status !== 200) {
      console.error("Request Error", value);
      if (res.status === 401) {
        return UnauthorizedSymbol;
      } else if (res.status === 404) {
        throw new NotFoundError(
          value?.code || "NotFound",
          value?.message || "Not Found.",
          value?.details
        );
      } else throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    if (e.code) throw e;
    else throw new Error("Network Error");
  }
}

export async function serverPost<Request, Response>(
  conn: SavedConnection,
  path: string,
  body: Request,
  auth?: [string, string] | null
): Promise<Response> {
  const res = await fetch(`${conn.url}/${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(auth ? _authHeader(auth) : {}),
    },
    method: "post",
    body: JSON.stringify(body),
  });
  try {
    const value = await res.json();
    if (res.status !== 200) {
      console.log("Server Error", value);
      console.log(body);
      throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    console.error(e);
    throw new Error("Network request failed");
  }
}

const isOnClient = !!global.window;

export function useConnectionLease(savedConn: SavedConnection | null) {
  const queryClient = useQueryClient();
  const connectionLease = useMemo(() => {
    return savedConn && isOnClient && leaseConnection(savedConn, queryClient);
  }, [savedConn]);
  useEffect(() => {
    return () => {
      connectionLease?.release();
    };
  }, [connectionLease]);
  return connectionLease?.connection || null;
}

export function SavedConnectionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: null | SavedConnection;
}) {
  const connection = useConnectionLease(value);
  return <ConnectionProvider value={connection}>{children}</ConnectionProvider>;
}
