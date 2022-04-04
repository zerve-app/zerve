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
    {}
  );
}

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const context = useQueryContext();
  return useQuery([context?.key, "z", ...path, ".node", "value"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getZ(context, path);
    return results;
  });
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
  return useQuery([context?.key, "z", ".schemas-computed"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getZ(context, ["Store", "State", "$schemas"]);
    console.log("LOL", results);
    return ZSchemaSchema;
    // return results;
  });
}

useZNodeValue([]);
