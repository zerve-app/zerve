import {
  ensureUniqueValueKeys,
  getDefaultSchemaValue,
  SchemaStore,
  ZSchema,
} from "@zerve/zed";
import { useMutation, useQueryClient } from "react-query";
import { useConnection } from "./Connection";
import { postZAction } from "./ServerCalls";

export function useCreateEntry(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "CreateValue",
          value: {
            name,
            schema: { type: "null" },
            value: null,
          },
        });
      } else {
        // deprecated "local" behavior.. should be consolidated into logic above
        // await dispatch(name, {
        //   type: "WriteFile",
        //   name: "ReadMe.md",
        //   value: "Welcome to your new File",
        // });
      }
    },
    {
      onSuccess: (something, name) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          ".node",
        ]);
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          name,
        ]);
      },
    },
  );
}

export function useCreateSchema(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (schemaName: string) => {
      if (!conn) return;
      await postZAction(conn, [...storePath, "Dispatch"], {
        name: "WriteSchema",
        value: {
          schemaName,
          schema: { type: "null" },
        },
      });
    },
    {
      onSuccess: (something, name) => {
        queryClient.invalidateQueries([conn?.key, "z", ...storePath, "State"]);
      },
    },
  );
}

export function useDeleteEntry(
  storePath: string[],
  opts?: { onSuccess?: () => void },
) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "Delete",
          value: {
            name,
          },
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (_, name) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          ".node",
        ]);
        opts?.onSuccess?.();
      },
    },
  );
}

export function useSaveEntry(storePath: string[]) {
  if (!storePath) throw new Error("Cannot useSaveEntry withtout storePath");
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; value: any; schema: ZSchema }) => {
      if (conn) {
        const { name, value, schema } = payload;
        const actualValue = ensureUniqueValueKeys(value, schema);
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteValue",
          value: { name, value: actualValue },
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (something, { name }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          name,
          ".node",
          "value", // todo maybe we dont need this
        ]);
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          name,
          "fullComputedEntry",
        ]);
      },
    },
  );
}

export function useRenameEntry(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { prevName: string; newName: string }) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "RenameValue",
          value: payload,
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (something, { name }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State", // well this is aggressive..
        ]);
      },
    },
  );
}

export function useSaveEntrySchema(
  storePath: string[],
  schemaStore: SchemaStore,
) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; schema: any }) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteSchemaValue",
          value: {
            name: payload.name,
            value: getDefaultSchemaValue(payload.schema, schemaStore),
            schema: payload.schema,
          },
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (something, { name }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          name,
        ]);
      },
    },
  );
}

export function useSaveStoreSchema(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { schemaName: string; schema: ZSchema }) => {
      const { schema, schemaName } = payload;
      let actualSchema = schema;
      if (schema.type === "object") {
        let required = schema.required || [];
        if (required?.indexOf("$key") === -1) {
          required = ["$key", ...required];
        }
        actualSchema = {
          ...schema,
          properties: {
            ...(schema.properties || {}),
            $key: {
              type: "string",
              // todo maybe annotate this further and ensure the key is a slug
            },
          },
          required,
        };
        if (
          actualSchema.properties.key &&
          actualSchema.properties.key.type !== "string"
        ) {
          throw new Error(
            `Object "key" property may only be Text if it is defined.`,
          );
        }
        if (
          actualSchema.properties.Key &&
          actualSchema.properties.Key.type !== "string"
        ) {
          throw new Error(
            `Object "Key" property may only be Text if it is defined.`,
          );
        }
      }
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteSchema",
          value: { schema: actualSchema, schemaName },
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (something, { schemaName }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          "$schemas",
        ]);
      },
    },
  );
}

export function useZNodeStateWrite(path: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (value: any) => {
      if (!conn) {
        return;
      }
      const response = await postZAction(conn, [...path, "set"], value);
      // this is not allowed because we are in z-query, so we need some mechanism for this
      // const eventId = await storeHistoryEvent("SetZState", {
      //   value,
      //   path,
      //   response,
      //   connection: conn.key,
      // });
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries()
      },
    },
  );
}

export function useDeleteSchema(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (schemaName: string) => {
      if (!conn) {
        return;
      }
      await postZAction(conn, [...storePath, "Dispatch"], {
        name: "DeleteSchema",
        value: { schemaName },
      });
    },
    {
      onSuccess: (something, { schemaName }) => {
        queryClient.invalidateQueries([conn?.key, "z", ...storePath, "State"]);
        // showToast(`${schemaName} Schema Deleted`);
      },
    },
  );
}

export function useRenameSchema(storePath: string[]) {
  const conn = useConnection();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { prevName: string; newName: string }) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "RenameSchema",
          value: payload,
        });
      } else {
        // "local" behavior.. should be consolidated into logic above
      }
    },
    {
      onSuccess: (something, { name }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State", // well this is aggressive..
        ]);
      },
    },
  );
}
