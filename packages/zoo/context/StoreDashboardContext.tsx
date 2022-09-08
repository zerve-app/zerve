import { Icon } from "@zerve/zen";
import { ComponentProps, createContext, useContext } from "react";
import { NavFeatureLink, NavLinkButton } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type StoreFeatureProps = {
  title: string;
  storePath: Array<string>;
  onStoreDelete: () => void;
  onStoreRename: (newName: string) => void;
  icon: null | ComponentProps<typeof Icon>["name"];
  onBack?: () => void;
};

export type StoreNavigationState =
  | {
      key: "entries";
      child?: "create" | "schema";
      entryName?: string;
      path?: Array<string>;
    }
  | {
      key: "schemas";
      child?: "create";
      schema?: string;
      path?: Array<string>;
    }
  | {
      key: "settings";
    };

export function StoreFeatureLink(
  props: Omit<
    ComponentProps<typeof NavFeatureLink<StoreNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavFeatureLink<StoreNavigationState>
      Context={StoreDashboardContext}
      {...props}
    />
  );
}

export function StoreFeatureLinkButton(
  props: Omit<
    ComponentProps<typeof NavLinkButton<StoreNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavLinkButton<StoreNavigationState>
      Context={StoreDashboardContext}
      {...props}
    />
  );
}

export const StoreDashboardContext =
  createContext<null | FragmentContext<StoreNavigationState>>(null);

export type UnsavedCtx = {
  getDirtyValue: (id: string) => any;
  claimDirty: (id: string, value: any) => void;
  releaseDirty: (id: string) => void;
  discardDirty: () => void;
  dirtyId: null | string;
};
export const UnsavedContext = createContext<null | UnsavedCtx>(null);

export function useUnsavedContext() {
  const ctx = useContext(UnsavedContext);
  if (!ctx)
    throw new Error(
      "Must use this feature within an UnsavedContext Environment ",
    );
  return ctx;
}
