// NOTE: THIS FILE IS NOT USED CURRENTLY.
// WE WILL BRING BACK LIVE CONNECTIONS AT SOME POINT
// LET @ERICVICENTI KNOW IF THIS SHOULD BE PRIORITIZED

import { createZState, ZObservable, ZBooleanSchema } from "@zerve/zed";
import { useEffect, useMemo } from "react";
import { QueryClient, useQueryClient } from "react-query";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Connection } from "./Connection";

const ClientIdSchema = { type: ["null", "string"] } as const;

export type LiveConnection = Connection & {
  isConnected: ZObservable<ZBooleanSchema>;
  clientId: ZObservable<typeof ClientIdSchema>;
};

const liveConnectionStore = new Map<
  string,
  [LiveConnection, number, () => void]
>();

function startConnection(
  savedConn: Connection,
  queryClient: QueryClient,
): [LiveConnection, () => void] {
  const [httpProtocol, hostPort] = savedConn.url.split("://");
  const wsProtocol = httpProtocol === "https" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${hostPort}`;
  if (!window) throw new Error("Cannot start live connection on server side.");
  const ws = new ReconnectingWebSocket(wsUrl, undefined, {
    constructor: window.WebSocket,
  });
  const clientId = createZState({ type: ["null", "string"] } as const, null);
  const isConnected = createZState({ type: "boolean" } as const, false);

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
        message.value,
      );

      queryClient.setQueryData(
        [savedConn?.key, "z", ...message.path, ".node"],
        (node) => {
          return { ...node, node: message.value };
        },
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
  savedConn: Connection,
  queryClient: QueryClient,
): {
  connection: LiveConnection;
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

const isOnClient = !!global.window;

export function useConnectionLease(savedConn: Connection | null) {
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
