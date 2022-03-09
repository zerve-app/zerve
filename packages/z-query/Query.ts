import { Query, useQuery } from "react-query";
import { useConnectionContext } from "./Connection";
import { getDoc, listDocs, getActions, getModuleList } from "./ServerCalls";

export type QueryOptions = {
  skipLoading?: boolean;
};

export function useDocList(options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery<any>([context.key, "docs", "child-list"], async () => {
    if (options?.skipLoading) return undefined;
    return { docs: await listDocs(context) };
  });
}

export function useDoc(name: string, options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery(
    [context.key, "docs", "children", name, "value"],
    async () => {
      if (!name) return undefined;
      if (options?.skipLoading) return undefined;
      return await getDoc(context, name);
    }
  );
}

export function useActions(category?: string, options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery([context.key, "actions", category], async () => {
    if (options?.skipLoading) return undefined;
    return await getActions(context, category);
  });
}

export function useModuleList(options?: QueryOptions) {
  const context = useConnectionContext();
  return useQuery([context.key, "modules"], async () => {
    if (options?.skipLoading) return undefined;
    return await getModuleList(context);
  });
}
