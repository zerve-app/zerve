import {
  ConstSchemaSchema,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";
import { showToast } from "@zerve/ui";
import { useMutation, useQueryClient } from "react-query";
import { useQueryContext } from "./Connection";
import { postZAction } from "./ServerCalls";

export function useCreateFile() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State",
          ".node",
        ]);
        queryClient.invalidateQueries([conn?.key, "z", "Store", "State", name]);
      },
    }
  );
}

export function useCreateSchema() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (schemaName: string) => {
      if (!conn) return;
      await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State",
          "$schemas",
        ]);
      },
    }
  );
}

export function useDeleteFile() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State",
          ".node",
        ]);
        showToast(`${name} Deleted`);
      },
    }
  );
}

export function useSaveFile() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; value: any }) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State",
          name,
          ".node",
          "value",
        ]);
      },
    }
  );
}

export function useRenameFile() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { prevName: string; newName: string }) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State", // well this is aggressive..
        ]);
      },
    }
  );
}

export function useSaveFileSchema(schemaStore: SchemaStore) {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; schema: any }) => {
      if (conn) {
        console.log(
          "ok OK ",
          getDefaultSchemaValue(payload.schema, schemaStore)
        );
        await postZAction(conn, ["Store", "Dispatch"], {
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
        queryClient.invalidateQueries([conn?.key, "z", "Store", "State", name]);
      },
    }
  );
}

export function useSaveSchema() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { schemaName: string; schema: any }) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
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
          "Store",
          "State",
          "$schemas",
        ]);
      },
    }
  );
}

export function useDeleteSchema() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { schemaName: string }) => {
      if (!conn) {
        return;
      }
      await postZAction(conn, ["Store", "Dispatch"], {
        name: "DeleteSchema",
        value: payload,
      });
    },
    {
      onSuccess: (something, { schemaName }) => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          "Store",
          "State",
          "$schemas",
        ]);
        showToast(`${schemaName} Schema Deleted`);
      },
    }
  );
}
