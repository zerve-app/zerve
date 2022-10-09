import {
  displayStoreFileName,
  expandSchema,
  ZSchema,
  ZSchemaSchema,
} from "@zerve/zed";
import {
  NotFoundSymbol,
  UnauthorizedSymbol,
  useConnection,
  useRequiredConnection,
} from "@zerve/zoo-client/Connection";
import {
  ConnectionExceptionContext,
  QueryOptions,
  useConnectionQuery,
} from "@zerve/zoo-client/Query";
import { getZ } from "@zerve/zoo-client/ServerCalls";
import { useContext, useMemo } from "react";
import {
  getValueImport,
  JSONSchemaEditorContext,
} from "@zerve/zen/JSONSchemaEditorUtilities";

export function schemaStoreToSchema(
  schemaStore: Record<string, ZSchema>,
  filterRef?: string,
) {
  const refSchemas = Object.entries(schemaStore || {})
    .filter(([schemaName]) => {
      if (filterRef === schemaName) return false;
      return true;
    })
    .map(([schemaName, schema]) => {
      const $id = `https://type.zerve.link/${schemaName}`;
      return {
        $id,
        type: "object",
        properties: {
          title: { const: displayStoreFileName(schemaName) },
          $ref: { const: $id },
        },
        additionalProperties: false,
        required: ["$ref", "title"],
      };
    });
  const finalSchema = {
    oneOf: [
      ...ZSchemaSchema.oneOf.map((zSubSchema) => {
        if (zSubSchema.title === "List Schema") {
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
        } else if (zSubSchema.title === "Object Schema") {
          return {
            ...zSubSchema,
            properties: {
              ...zSubSchema.properties,
              properties: {
                ...zSubSchema.properties.properties,
                additionalProperties: {
                  ...zSubSchema.properties.properties.additionalProperties,
                  oneOf: [
                    ...zSubSchema.properties.properties.additionalProperties
                      .oneOf,
                    ...refSchemas,
                  ],
                },
              },
              additionalProperties: {
                ...zSubSchema.properties.additionalProperties,
                oneOf: [
                  ...zSubSchema.properties.additionalProperties.oneOf,
                  ...refSchemas,
                ],
              },
            },
          };
        } else if (zSubSchema.title === "One Of Schema") {
          return {
            ...zSubSchema,
            properties: {
              ...zSubSchema.properties,
              oneOf: {
                ...zSubSchema.properties.oneOf,
                items: {
                  ...zSubSchema.properties.oneOf.items,
                  oneOf: [
                    ...zSubSchema.properties.oneOf.items.oneOf,
                    ...refSchemas,
                  ],
                },
              },
            },
          };
        } else {
          return zSubSchema;
        }
      }),
      ...refSchemas,
    ],
    $refSchemas: refSchemas,
    $schemaStore: schemaStore,
  };
  return finalSchema;
}

export function useStoreSchemas(storePath: string[], options?: QueryOptions) {
  const conn = useConnection();
  if (!conn) throw new Error("Cannot useDoc outside of connection context.");
  return useConnectionQuery<Record<string, ZSchema>>(
    conn,
    [conn.key, "z", ...storePath, "State", "$schemas"],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const schemas = await getZ(conn, [...storePath, "State", "$schemas"]);
      return schemas as Record<string, ZSchema>;
    },
    {
      onError: options?.onError,
    },
  );
}

export function useStoreSchema(
  storePath: string[],
  schemaName: string,
  options?: QueryOptions,
) {
  const schemas = useStoreSchemas(storePath, options);
  const schema = useMemo(() => {
    return {
      ...schemas,
      data: {
        schema: schemas.data?.[schemaName],
        schemaSchema: schemaStoreToSchema(schemas.data, schemaName),
        schemaStore: schemas.data,
      },
    };
  }, [schemas, schemas.data]);

  return schema;
}

export function useStoreEntrySchema(
  storePath: string[],
  entryName: string,
  options?: QueryOptions,
) {
  const schemas = useStoreSchemas(storePath, options);
  const conn = useRequiredConnection();
  const nodePath = [...storePath, "State", entryName, "schema"];
  const { onUnauthorized } = useContext(ConnectionExceptionContext);
  const schemaQuery = useConnectionQuery(
    conn,
    [
      conn.key,
      "z",
      ...nodePath,
      "entrySchema",
      // query key should include some id of schemas here, because if the schemas change we need to re-query the node for schemaSchema and schemaStore to be updated
    ],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, nodePath);
      if (results === UnauthorizedSymbol) {
        onUnauthorized?.();
        return {
          schema: UnauthorizedSymbol,
          schemaSchema: UnauthorizedSymbol,
          schemaStore: schemas.data,
        };
      }
      return {
        schema: results,
        schemaSchema: schemas.data && schemaStoreToSchema(schemas.data),
        schemaStore: schemas.data,
      };
    },
    {
      enabled: !!schemas.data,
      cacheTime: 10000,
      onError: options?.onError,
    },
  );
  return {
    isLoading: schemaQuery.isLoading || schemas.isLoading,
    isFetching: schemaQuery.isFetching || schemas.isFetching,
    data: schemaQuery.data,
    error: schemaQuery.error || schemas.error,
    refetch: () => {
      schemaQuery.refetch();
      schemas.refetch();
    },
  };
}

export function useStoreEntry(
  storePath: string[],
  entryName: string,
  editorContext: JSONSchemaEditorContext,
  options?: QueryOptions,
) {
  const nodePath = [...storePath, "State", entryName];
  const conn = useRequiredConnection();
  const { onUnauthorized } = useContext(ConnectionExceptionContext);
  const importValue = useMemo(() => {
    return getValueImport(editorContext.OverrideFieldComponents);
  }, [editorContext.OverrideFieldComponents]);
  const schemas = useStoreSchemas(storePath);
  const entryQuery = useConnectionQuery(
    conn,
    [
      conn.key,
      "z",
      ...nodePath,
      "fullComputedEntry",
      // query key should include some id of schemas here, because if the schemas change we need to re-query the node so value import and schema expansion is updated
    ],
    async () => {
      if (!conn || options?.skipLoading) return undefined;
      const results = await getZ(conn, nodePath);
      if (results === NotFoundSymbol) {
        return {
          value: NotFoundSymbol,
          schema: NotFoundSymbol,
          schemaStore: schemas.data,
        };
      }
      if (results === UnauthorizedSymbol) {
        onUnauthorized?.();
        return {
          schema: UnauthorizedSymbol,
          value: UnauthorizedSymbol,
          schemaStore: schemas.data,
        };
      }
      const { value, schema } = results;
      const fullSchema = expandSchema(schema, schemas.data);
      const importedValue = importValue(value, fullSchema);
      return {
        schema: fullSchema,
        value: importedValue,
        schemaStore: schemas.data,
      };
    },
    {
      enabled: !!schemas.data,
      cacheTime: 10000,
      onError: options?.onError,
    },
  );
  return {
    isLoading: entryQuery.isLoading || schemas.isLoading,
    isFetching: entryQuery.isFetching || schemas.isFetching,
    error: entryQuery.error || schemas.error,
    data: entryQuery.data,
    refetch: () => {
      entryQuery.refetch();
      schemas.refetch();
    },
  };
}
