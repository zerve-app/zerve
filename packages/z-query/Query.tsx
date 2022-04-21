import {
  notifyManager,
  Query,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "react-query";
import { getZ } from "./ServerCalls";
import { useLiveConnection, useConnection, Connection } from "./Connection";
import { getDoc, listDocs, getActions, getModuleList } from "./ServerCalls";
import { getTypedZ } from "./ServerCalls";
import { useEffect, useMemo } from "react";
import { displayStoreFileName, ZSchemaSchema } from "@zerve/core";

export type QueryOptions = {
  skipLoading?: boolean;
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

function useConnectionQuery<A, B, C>(
  conn: Connection | null,
  path: string[],
  getQuery: (a: A, key: QueryKey) => Promise<B>,
  options?: Omit<UseQueryOptions<A, B, C, QueryKey>, "queryKey" | "queryFn">
) {
  const queryResult = useQuery<A, B, C>(
    path,
    async (a: A, key: QueryKey) => {
      const result = await getQuery(a, key);
      return result;
    },
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

export function useDoc(name: string, options?: QueryOptions) {
  const conn = useConnection();
  return useConnectionQuery(
    conn,
    [conn?.key, "docs", "children", name, "value"],
    async () => {
      if (!context || !name) return undefined;
      if (options?.skipLoading) return undefined;
      return await getDoc(context, name);
    }
  );
}

export function useZNode(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  const liveConn = useLiveConnection(conn);
  return useConnectionQuery(
    conn,
    [conn?.key, "z", ...path, ".node"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getTypedZ(conn, path, liveConn);
      return results;
    },
    {
      cacheTime: 10000,
    }
  );
}

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  return useConnectionQuery(
    conn,
    [conn?.key, "z", ...path, ".node", "value"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, path);
      return results;
    },
    {
      cacheTime: 10000,
    }
  );
}

export function useZChildren(path: string[], options?: QueryOptions) {
  const conn = useConnection();
  return useConnectionQuery(
    conn,
    [conn?.key, "z", ...path, "children"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, path);
      return results;
    }
  );
}

export function useZStoreSchemas(storePath: string[], options?: QueryOptions) {
  const conn = useConnection();
  return useConnectionQuery(
    conn,
    [conn?.key, "z", ...storePath, "State", "$schemas"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const schemas = await getZ(conn, [...storePath, "State", "$schemas"]);
      return schemas;
    }
  );
}

export function connectionSchemasToZSchema(schemas) {
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
      data: connectionSchemasToZSchema(schemas.data),
    };
  }, [schemas, schemas.data]);
}
