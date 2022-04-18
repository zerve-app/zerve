import {
  ConstSchemaSchema,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";
import { showToast } from "@zerve/ui";
import { useMutation, useQueryClient } from "react-query";
import { storeHistoryEvent } from "../../apps/z-mobile/app/History";
import { useQueryContext } from "./Connection";
import { postZAction } from "./ServerCalls";

export function useCreateFile(storePath: string[]) {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  console.log("USE CREATE FILE", { storePath });
  return useMutation(
    async (name: string) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteSchemaValue",
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
    }
  );
}

export function useCreateSchema(storePath: string[]) {
  const conn = useQueryContext();
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
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath,
          "State",
          "$schemas",
        ]);
      },
    }
  );
}

export function useDeleteFile(storePath: string[]) {
  const conn = useQueryContext();
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
        showToast(`${name} Deleted`);
      },
    }
  );
}

export function useSaveFile(storePath: string[]) {
  if (!storePath) throw new Error("Cannot useSaveFile withtout storePath");
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; value: any }) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteValue",
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
          "State",
          name,
          ".node",
          "value",
        ]);
      },
    }
  );
}

export function useRenameFile(storePath: string[]) {
  const conn = useQueryContext();
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
    }
  );
}

export function useSaveFileSchema(
  storePath: string[],
  schemaStore: SchemaStore
) {
  const conn = useQueryContext();
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
    }
  );
}

export function useSaveSchema(storePath: string[]) {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { schemaName: string; schema: any }) => {
      if (conn) {
        await postZAction(conn, [...storePath, "Dispatch"], {
          name: "WriteSchema",
          value: payload,
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
    }
  );
}

export function useZNodeStateWrite(path: string[]) {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (value: any) => {
      if (!conn) {
        return;
      }
      const response = await postZAction(conn, [...path, "set"], value);
      const eventId = await storeHistoryEvent("SetZState", {
        value,
        path,
        response,
        connection: conn.key,
      });
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries()
      },
    }
  );
}

export function useDeleteSchema(storePath: string[]) {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { schemaName: string }) => {
      if (!conn) {
        return;
      }
      await postZAction(conn, [...storePath, "Dispatch"], {
        name: "DeleteSchema",
        value: payload,
      });
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
        showToast(`${schemaName} Schema Deleted`);
      },
    }
  );
}
