import { useMemo } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { useFragmentNavigate } from "../web/Fragment";
import { useNavigation } from "@react-navigation/native";

export function useStoreNavigation() {
  const navigate = useFragmentNavigate<StoreNavigationState>(
    StoreDashboardContext,
  );
  const { pop } = useNavigation();
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
      openSettings: () => {
        navigate({ key: "settings" });
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
      backToSchema: (schema: string, path: string[]) => {
        path.forEach(() => {
          pop();
        });
      },
      backToEntries: () => {
        pop();
      },
      backToEntry: (entryName: string, path: string[]) => {
        path.forEach(() => {
          pop();
        });
      },
      backToEntrySchema: (entryName: string, path: string[]) => {
        path.forEach(() => {
          pop();
        });
      },
    }),
    [],
  );
}
