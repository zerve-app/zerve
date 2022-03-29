import { useMutation, useQueryClient } from "react-query";
import { useConnectionContext } from "./Connection";
import { postZAction } from "./ServerCalls";

export function useCreateFile() {
  const conn = useConnectionContext();
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

export function useDeleteFile() {
  const conn = useConnectionContext();
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
