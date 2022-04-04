import { getDefaultSchemaValue } from "@zerve/core";
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
      onSuccess: () => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          "Store",
          "State",
          ".node",
        ]);
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

export function useSaveFileSchema() {
  const conn = useQueryContext();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { name: string; schema: any }) => {
      if (conn) {
        await postZAction(conn, ["Store", "Dispatch"], {
          name: "WriteSchemaValue",
          value: {
            name: payload.name,
            value: getDefaultSchemaValue(payload.schema),
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
