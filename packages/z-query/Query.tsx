import { notifyManager, Query, useQuery } from "react-query";
import { getZ } from "./ServerCalls";
import { useLiveConnection, useQueryContext } from "./Connection";
import { getDoc, listDocs, getActions, getModuleList } from "./ServerCalls";
import { getTypedZ } from "./ServerCalls";
import { useEffect } from "react";
import { ZSchemaSchema } from "@zerve/core";

export type QueryOptions = {
  skipLoading?: boolean;
};

export function useConnectionRootType(options?: QueryOptions) {
  return useZNodeValue([".type"], options);
}

export function useConnectionProjects(options?: QueryOptions) {
  return useZNode(["Store", "State"], options);
}

export function useDoc(name: string, options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery(
    [context?.key, "docs", "children", name, "value"],
    async () => {
      if (!context || !name) return undefined;
      if (options?.skipLoading) return undefined;
      return await getDoc(context, name);
    }
  );
}

export function useZNode(path: string[], options?: QueryOptions) {
  const context = useQueryContext();
  const conn = useLiveConnection(context);
  return useQuery(
    [context?.key, "z", ...path, ".node"],
    async () => {
      if (!context || options?.skipLoading) return undefined;
      const results = await getTypedZ(context, path, conn);
      return results;
    },
    {
      cacheTime: 10000,
    }
  );
}

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery(
    [context?.key, "z", ...path, ".node", "value"],
    async () => {
      if (!context || options?.skipLoading) return undefined;
      const results = await getZ(context, path);
      return results;
    },
    {
      cacheTime: 10000,
    }
  );
}

export function useZChildren(path: string[], options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery([context?.key, "z", ...path, "children"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getZ(context, path);
    return results;
  });
}

export function useZConnectionSchemas(options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery(
    [context?.key, "z", "Store", "State", "$schemas"],
    async () => {
      if (!context || options?.skipLoading) return undefined;
      const schemas = await getZ(context, ["Store", "State", "$schemas"]);
      return schemas;
    }
  );
}

export function useZConnectionJSONSchema(options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery(
    [context?.key, "z", "Store", "State", "$schemas", ".json-schema"],
    async () => {
      console.log("Q START");
      if (!context || options?.skipLoading) return undefined;
      const schemas = await getZ(context, ["Store", "State", "$schemas"]);
      const refSchemas = Object.entries(schemas || {}).map(
        ([schemaName, schema]) => {
          return {
            type: "object",
            properties: {
              title: { const: schemaName },
              $ref: { const: `https://type.zerve.link/${schemaName}` },
            },
            additionalProperties: false,
            required: ["type", "$ref"],
          };
        }
      );
      console.log("Q HERE");
      const finalSchema = {
        oneOf: [
          ...ZSchemaSchema.oneOf,
          // .map((subSchema) => {
          //   if (subSchema?.type === "Object") {
          //     return {
          //       ...subSchema,
          //       additionalProperties: {
          //         oneOf: [
          //           ...subSchema.additionalProperties.oneOf,
          //           ...refSchemas,
          //         ],
          //       },
          //       properties: Object.fromEntries(
          //         Object.entries(subSchema.properties || {}).map(
          //           ([schemaId, schema]) => {
          //             return [
          //               schemaId,
          //               { oneOf: [...schema.oneOf, ...refSchemas] },
          //             ];
          //           }
          //         )
          //       ),
          //     };
          //   }
          //   return subSchema;
          // }),
          ...refSchemas,
        ],
      };
      return finalSchema;
    }
  );
}
