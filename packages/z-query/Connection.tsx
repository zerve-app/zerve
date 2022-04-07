import {
  BooleanSchemaSchema,
  createZState,
  ZBooleanSchema,
  ZObservable,
  ZStringSchema,
} from "@zerve/core";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAction, useZObservable, useZObservableMaybe } from "@zerve/react";
import ReconnectingWebsocket from "reconnecting-websocket";
import { useQueryClient, QueryClient } from "react-query";

export type ServerMessage = {};
export type QueryContext = {
  url: string;
  key: string;
};
const ClientIdSchema = { type: ["null", "string"] } as const;
export type Connection = QueryContext & {
  isConnected: ZObservable<ZBooleanSchema>;
  clientId: ZObservable<typeof ClientIdSchema>;
};

// const DefaultProductionConnection = {
//   url: `https://zerve.app`,
//   key: "DefaultProductionConnection",
// };
// const DefaultDevConnection = {
//   url: `http://localhost:3888`,
//   key: "DefaultDevConnection",
// };

const liveConnectionStore = new Map<string, [Connection, number, () => void]>();

function startConnection(
  queryContext: QueryContext,
  queryClient: QueryClient
): [Connection, () => void] {
  const [httpProtocol, hostPort] = queryContext.url.split("://");
  const wsProtocol = httpProtocol === "https" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${hostPort}`;
  const ws = new ReconnectingWebsocket(wsUrl);
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
        [queryContext?.key, "z", ...message.path, ".node", "value"],
        message.value
      );

      queryClient.setQueryData(
        [queryContext?.key, "z", ...message.path, ".node"],
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
    closeCacheSubscription();
  }
  const connection = {
    ...queryContext,
    clientId: clientId.z.state,
    isConnected: isConnected.z.state,
  };
  return [connection, close];
}

function leaseConnection(
  queryContext: QueryContext,
  queryClient: QueryClient
): {
  connection: Connection;
  release: () => void;
} {
  const connectionKey = queryContext.key;
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
    const [connection] = stored;

    return { connection, release };
  }
  const [connection, closeConnection] = startConnection(
    queryContext,
    queryClient
  );
  liveConnectionStore.set(connectionKey, [connection, 1, closeConnection]);
  return { connection, release };
}

const QueryReactContext = createContext<QueryContext | null>(null);

export const QueryConnectionProvider = QueryReactContext.Provider;

export function useQueryContext(): QueryContext | null {
  return useContext(QueryReactContext);
}

export async function serverGet<Response>(
  context: QueryContext,
  path: string,
  query?: Record<string, string>
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
      },
    }
  );
  try {
    const value = await res.json();
    if (res.status !== 200) {
      console.error("Request Error", value);
      throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    throw new Error("Network Error");
  }
}

export async function serverPost<Request, Response>(
  context: QueryContext,
  path: string,
  body: Request
): Promise<Response> {
  const res = await fetch(`${context.url}/${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify(body),
  });
  try {
    const value = await res.json();
    if (res.status !== 200) {
      console.log("Huh eh", value);
      console.log(body);
      throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    throw new Error("Network request failed");
  }
}

export function useLiveConnection(queryContext: QueryContext | null) {
  const queryClient = useQueryClient();
  const connectionLease = useMemo(
    () => queryContext && leaseConnection(queryContext, queryClient),
    [queryContext]
  );
  useEffect(() => {
    return () => {
      connectionLease?.release();
    };
  }, [connectionLease]);
  return connectionLease?.connection;
}

// export function useConnectionStatus() {
//   const queryContext = useQueryContext();
//   const conn = useLiveConnection(queryContext);
//   // let [isConnected, setIsConnected] = useState(false);
//   let [isLoading, setIsLoading] = useState(true);
//   let [isReachable, setIsReachable] = useState(false);

//   function doUpdateStatus(connectionUrl: string) {
//     setIsLoading(true);
//     fetch(connectionUrl)
//       .then((resp) => {
//         setIsReachable(resp.status === 200);
//       })
//       .catch((e) => {
//         setIsReachable(false);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }

//   useEffect(() => {
//     if (!queryContext) return;
//     doUpdateStatus(queryContext.url);
//     const updateStatusInterval = setInterval(() => {
//       doUpdateStatus(queryContext.url);
//     }, 5000);
//     const [conn, release] = leaseConnection(queryContext);
//     conn;
//     return () => {
//       release();
//       clearInterval(updateStatusInterval);
//     };
//   }, [queryContext?.url]);
//   return { isConnected, isLoading, isReachable };
// }

export function useConnectionStatus() {
  const queryContext = useQueryContext();
  const connection = useLiveConnection(queryContext);
  const isConnected = useZObservableMaybe(connection?.isConnected);
  return {
    isConnected,
  };
}
