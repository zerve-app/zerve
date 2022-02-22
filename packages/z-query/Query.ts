import { useQuery } from "react-query";
import { getDoc, listDocs } from "./ServerCalls";

export function useDocListQuery() {
  return useQuery(["docs", "child-list"], async () => {
    return { docs: await listDocs() };
  });
}

export function useDoc(name: string) {
  return useQuery(["docs", "children", name, "value"], async () => {
    if (!name) return undefined;
    return await getDoc(name);
  });
}
