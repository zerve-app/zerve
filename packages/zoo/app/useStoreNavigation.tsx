import { useMemo } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { useFragmentNavigate } from "../web/Fragment";

export function useStoreNavigation() {
  const navigate = useFragmentNavigate<StoreNavigationState>(
    StoreDashboardContext,
  );
  return useMemo(
    () => ({
      openEntry: (entryName: string, path?: string[]) => {
        navigate({ key: "entries", entryName, path });
      },
      openNewEntry: () => {
        navigate({ key: "entries", child: "create" });
      },
      openSchema: (schema: string, path?: string[]) => {
        navigate({ key: "schemas", schema, path });
      },
      openSchemas: () => {
        navigate({ key: "schemas" });
      },
      openHistory: () => {},
      replaceToEntry: (entryName: string, path?: string[]) => {
        navigate({ key: "entries", entryName, path }, true);
      },
      openEntrySchema: (entryName: string, path?: string[]) => {
        navigate({ key: "entries", entryName, path, child: "schema" });
      },
      replaceToSchemas: () => {
        navigate({ key: "schemas" }, true);
      },
      replaceToEntries: () => {
        navigate({ key: "entries" }, true);
      },
      replaceToEntrySchema: (entryName: string) => {
        navigate({ key: "entries", entryName, child: "schema" }, true);
      },
      replaceToSchema: (schema: string) => {
        navigate({ key: "schemas", schema }, true);
      },
    }),
    [],
  );
}
