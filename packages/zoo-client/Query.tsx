import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "react-query";
import { getZ } from "./ServerCalls";
import { useConnection, Connection, UnauthorizedSymbol } from "./Connection";
import { getTypedZ } from "./ServerCalls";
import { createContext, useContext, useEffect, useMemo } from "react";
import { GenericError } from "@zerve/zed";

export type QueryOptions = {
  skipLoading?: boolean;
  onError?: (e: GenericError<any, any>) => void;
};

export function useConnectionRootType(options?: QueryOptions) {
  return useZNodeValue([".type"], options);
}

export function useConnectionProjects(
  storePath: string[],
  options?: QueryOptions,
) {
  return useZNode([...storePath, "State"], options);
}

export function useConnectionQuery<Result>(
  conn: Connection | null,
  path: string[],
  getQuery: () => Promise<Result>,
  options?: Omit<
    UseQueryOptions<Result, void, Result, QueryKey>,
    "queryKey" | "queryFn"
  >,
) {
  const queryResult = useQuery<Result, void, Result, string[]>(
    path,
    async (ctx: QueryFunctionContext<string[], any>) => {
      const result = await getQuery();
      return result;
    },
    options,
  );
  useEffect(() => {
    return conn?.isConnected?.subscribe((isConn) => {
      if (isConn) {
        queryResult.refetch();
      }
    });
  }, [conn?.isConnected]);
  return queryResult;
}

export function useZNode(path: string[], options?: QueryOptions) {
  const connection = useConnection();
  const { onUnauthorized } = useContext(ConnectionExceptionContext);
  if (!connection)
    throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery(
    connection,
    [connection.key, "z", ...path, ".node"],
    async () => {
      if (!connection || options?.skipLoading) return undefined;
      const results = await getTypedZ(connection, path);
      if (results === UnauthorizedSymbol) onUnauthorized?.();
      return results;
    },
    {
      cacheTime: 10000,
      onError: options?.onError,
    },
  );
}

type ConnectionExceptionContext = {
  onUnauthorized?: () => void;
};

export const ConnectionExceptionContext =
  createContext<ConnectionExceptionContext>({});

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  const { onUnauthorized } = useContext(ConnectionExceptionContext);
  if (!conn) throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery(
    conn,
    [conn.key, "z", ...path, ".node", "value"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, path);
      if (results === UnauthorizedSymbol) onUnauthorized?.();
      return results;
    },
    {
      cacheTime: 10000,
      onError: options?.onError,
    },
  );
}

export function useZChildren(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  if (!conn) throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery(
    conn,
    [conn.key, "z", ...path, "children"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, path);
      return results;
    },
    {
      onError: options?.onError,
    },
  );
}
