import { Query, useQuery } from "react-query";
import { getZ } from "./ServerCalls";
import { useConnectionContext } from "./Connection";
import { getDoc, listDocs, getActions, getModuleList } from "./ServerCalls";
import { getTypedZ } from ".";

export type QueryOptions = {
  skipLoading?: boolean;
};

export function useConnectionProjects(options?: QueryOptions) {
  // const context = useConnectionContext();
  // return useQuery<any>([context.key, "docs", "child-list"], async () => {
  //   if (options?.skipLoading) return undefined;
  //   return { docs: await listDocs(context) };
  // });
  return useZNode(["Store", "State"], options);
}

export function useDoc(name: string, options?: QueryOptions) {
  const context = useConnectionContext();
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
  const context = useConnectionContext();
  return useQuery([context?.key, "z", ...path, ".node"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getTypedZ(context, path);
    return results;
  });
}

export function useZNodeValue(path: string[], options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery([context?.key, "z", ...path, ".node", "value"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getZ(context, path);
    return results;
  });
}

export function useZChildren(path: string[], options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery([context?.key, "z", ...path, "children"], async () => {
    if (!context || options?.skipLoading) return undefined;
    const results = await getZ(context, path);
    return results;
  });
}
