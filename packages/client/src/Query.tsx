import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "react-query";
import { getZ } from "./ServerCalls";
import { useConnection, Connection } from "./Connection";
import { getTypedZ } from "./ServerCalls";
import { useEffect, useMemo } from "react";
import {
  displayStoreFileName,
  GenericError,
  ZSchema,
  ZSchemaSchema,
} from "@zerve/core";

export type QueryOptions = {
  skipLoading?: boolean;
  onError?: (e: GenericError<any, any>) => void;
};

export function useConnectionRootType(options?: QueryOptions) {
  return useZNodeValue([".type"], options);
}

export function useConnectionProjects(
  storePath: string[],
  options?: QueryOptions
) {
  return useZNode([...storePath, "State"], options);
}

function useConnectionQuery<Result>(
  conn: Connection | null,
  path: string[],
  getQuery: () => Promise<Result>,
  options?: { onError: (e: GenericError<any, any>) => void } & Omit<
    UseQueryOptions<Result, void, Result, QueryKey>,
    "queryKey" | "queryFn" | "onError"
  >
) {
  const queryResult = useQuery<Result, void, Result, QueryKey>(
    path,
    async (ctx: QueryFunctionContext<QueryKey, any>) => {
      const result = await getQuery();
      return result;
    },
    // @ts-ignore
    options
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
  if (!connection)
    throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery(
    connection,
    [connection.key, "z", ...path, ".node"],
    async () => {
      if (!connection || options?.skipLoading) return undefined;
      const results = await getTypedZ(connection, path);
      return results;
    },
    {
      cacheTime: 10000,
      onError: (e: any) => options?.onError?.(e as GenericError<any, any>),
    }
  );
}

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  if (!conn) throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery(
    conn,
    [conn.key, "z", ...path, ".node", "value"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, path);
      return results;
    },
    {
      cacheTime: 10000,
      onError: (e: any) => options?.onError?.(e as GenericError<any, any>),
    }
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
      onError: (e: any) => options?.onError?.(e as GenericError<any, any>),
    }
  );
}

export function useZStoreSchemas(storePath: string[], options?: QueryOptions) {
  const conn = useConnection();
  if (!conn) throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery<Record<string, ZSchema>>(
    conn,
    [conn.key, "z", ...storePath, "State", "$schemas"],
    // @ts-ignore
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const schemas = await getZ(conn, [...storePath, "State", "$schemas"]);
      return schemas as Record<string, ZSchema>;
    },
    {
      onError: (e: any) => options?.onError?.(e as GenericError<any, any>),
    }
  );
}

export function connectionSchemasToZSchema(schemas: Record<string, ZSchema>) {
  const refSchemas = Object.entries(schemas || {}).map(
    ([schemaName, schema]) => {
      return {
        type: "object",
        properties: {
          title: { const: displayStoreFileName(schemaName) },
          $ref: { const: `https://type.zerve.link/${schemaName}` },
        },
        additionalProperties: false,
        required: ["type", "$ref"],
      };
    }
  );
  const finalSchema = {
    oneOf: [
      ...ZSchemaSchema.oneOf.map((zSubSchema) => {
        if (zSubSchema.title === "List") {
          const listSchema = {
            ...zSubSchema,
            properties: {
              ...zSubSchema.properties,
              items: {
                oneOf: [...zSubSchema.properties.items.oneOf, ...refSchemas],
              },
            },
          };
          return listSchema;
        } else if (zSubSchema.title === "Object") {
          return {
            ...zSubSchema,
            properties: {
              ...zSubSchema.properties,
              properties: {
                ...zSubSchema.properties.properties,
                additionalProperties: {
                  oneOf: [
                    ...zSubSchema.properties.properties.additionalProperties
                      .oneOf,
                    ...refSchemas,
                  ],
                },
              },
              additionalProperties: {
                oneOf: [
                  ...zSubSchema.properties.additionalProperties.oneOf,
                  ...refSchemas,
                ],
              },
            },
          };
        } else {
          return zSubSchema;
        }
      }),
      ...refSchemas,
    ],
  };
  return finalSchema;
}

export function useZStoreJSONSchema(
  storePath: string[],
  options?: QueryOptions
) {
  const schemas = useZStoreSchemas(storePath, options);
  return useMemo(() => {
    return {
      ...schemas,
      // @ts-ignore
      data: connectionSchemasToZSchema(schemas.data),
    };
  }, [schemas, schemas.data]);
}
